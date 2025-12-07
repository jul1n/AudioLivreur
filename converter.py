import os
import shutil
import tempfile
import subprocess
import re
import asyncio
import ebooklib
from ebooklib import epub
from bs4 import BeautifulSoup

class Converter:
    def __init__(self, epub_path, ffmpeg_path, voice, rate, volume, keep_mp3s=False, max_parallel=3, 
                 progress_callback=None, log_callback=None, finished_callback=None, text_callback=None):
        self.epub_path = epub_path
        self.ffmpeg_path = ffmpeg_path
        self.voice = voice
        self.rate = rate
        self.volume = volume
        self.keep_mp3s = keep_mp3s
        self.max_parallel = max_parallel
        self.cancel_requested = False
        self.temp_dir = None
        
        self.progress_callback = progress_callback
        self.log_callback = log_callback
        self.finished_callback = finished_callback
        self.text_callback = text_callback

    def emit_text(self, text):
        if self.text_callback:
            self.text_callback(text)

    def scan_file(self):
        try:
            chapters = self.extract_text(self.epub_path)
            word_count = sum(len(text.split()) for _, text in chapters)
            return len(chapters), word_count
        except Exception as e:
            return 0, 0

    def emit_progress(self, current, total, msg):
        if self.progress_callback:
            self.progress_callback(current, total, msg)

    def emit_log(self, msg):
        if self.log_callback:
            self.log_callback(msg)

    def emit_finished(self, success, msg):
        if self.finished_callback:
            self.finished_callback(success, msg)

    def run(self):
        try:
            self.do_work()
        except Exception as e:
            import traceback
            self.emit_log(traceback.format_exc())
            self.emit_finished(False, str(e))

    def do_work(self):
        self.emit_log("[DEBUG] Starting conversion process...")
        self.emit_log(f"[DEBUG] File: {self.epub_path}")
        self.emit_log(f"[DEBUG] Using voice={self.voice}, rate={self.rate}, volume={self.volume}, parallel={self.max_parallel}")
        
        # 1. Extract text
        self.emit_progress(0, 100, "Extracting text...")
        self.emit_log("[DEBUG] Calling extract_text()...")
        chapters = self.extract_text(self.epub_path)
        self.emit_log(f"[DEBUG] Extraction complete. Found {len(chapters)} chapters.")
        
        if not chapters:
            self.emit_log("[ERROR] No chapters found!")
            raise Exception("No text could be extracted from the file.")

        # Save debug text file (User request for PDF debugging)
        try:
            debug_txt_path = os.path.splitext(self.epub_path)[0] + "_debug.txt"
            with open(debug_txt_path, "w", encoding="utf-8") as f:
                for title, text in chapters:
                    f.write(f"=== {title} ===\n\n{text}\n\n")
            self.emit_log(f"[DEBUG] Saved extracted text to: {debug_txt_path}")
        except Exception as e:
            self.emit_log(f"[WARNING] Could not save debug text: {e}")

        # 2. Temp Dir
        self.temp_dir = tempfile.mkdtemp(prefix="calibaudio_")
        self.emit_log(f"Temp directory: {self.temp_dir}")

        mp3_files = []
        total_steps = len(chapters) + 1

        # Pre-calculate word counts for efficiency
        chapter_word_counts = [len(text.split()) for _, text in chapters]
        total_words = sum(chapter_word_counts)
        self.emit_log(f"[DEBUG] Total words to process: {total_words}")

        # 3. Generate Audio
        import edge_tts
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            total_words_so_far = 0
            processing_queue = []
            
            for i, (title, text) in enumerate(chapters):
                if self.cancel_requested:
                    self.cleanup()
                    self.emit_finished(False, "Cancelled by user.")
                    return

                safe_title = "".join([c for c in title if c.isalnum() or c in (' ', '-', '_')]).strip()
                if not safe_title:
                    safe_title = f"Chapter_{i+1}"
                
                # Smart Splitting
                if len(text) > 5000:
                    chunks = self.split_text_smart(text, 5000)
                    for j, chunk in enumerate(chunks):
                        sub_title = f"{title} ({j+1}/{len(chunks)})"
                        safe_sub_title = f"{safe_title}_{j+1:02d}"
                        filename = f"{i+1:03d}_{j+1:02d}_{safe_sub_title}.mp3"
                        filepath = os.path.join(self.temp_dir, filename)
                        processing_queue.append({
                            'title': sub_title,
                            'text': chunk,
                            'filepath': filepath,
                            'chapter_index': i,
                            'word_count': len(chunk.split())
                        })
                else:
                    filename = f"{i+1:03d}_{safe_title}.mp3"
                    filepath = os.path.join(self.temp_dir, filename)
                    processing_queue.append({
                        'title': title,
                        'text': text,
                        'filepath': filepath,
                        'chapter_index': i,
                        'word_count': chapter_word_counts[i]
                    })

            # 3. Parallel Processing
            sem = asyncio.Semaphore(self.max_parallel)
            total_tasks = len(processing_queue)
            completed_tasks = 0
            
            async def process_item(item):
                nonlocal completed_tasks, total_words_so_far
                async with sem:
                    if self.cancel_requested: return None
                    
                    try:
                        self.emit_log(f"Generating: {item['title']}...")
                        # Pass title for progress updates
                        await self.generate_tts(item['text'], item['filepath'], total_words_so_far, total_words, item['title'])
                        
                        completed_tasks += 1
                        
                        # Update word count safely
                        total_words_so_far += item['word_count']
                        
                        # Final progress update for this item
                        percent = int((total_words_so_far / total_words) * 100) if total_words > 0 else 0
                        self.emit_progress(total_words_so_far, total_words, f"TTS: {item['title']} ({percent}%)")
                        self.emit_text(f"{total_words_so_far}/{total_words} mots")
                        
                        return (item['title'], item['filepath'])
                    except Exception as e:
                        self.emit_log(f"Error in {item['title']}: {e}")
                        raise e

            tasks = [process_item(item) for item in processing_queue]
            results = loop.run_until_complete(asyncio.gather(*tasks))
            
            # Filter out None results (cancelled) and sort by filename to ensure correct order
            mp3_files = sorted([r for r in results if r], key=lambda x: x[1])

            # 4. Merge
            if self.cancel_requested:
                self.cleanup()
                self.emit_finished(False, "Cancelled by user.")
                return

            self.emit_progress(total_words, total_words, "Merging to M4B...")
            self.emit_log("Merging with FFmpeg...")
            
            output_dir = os.path.dirname(self.epub_path)
            base_name = os.path.splitext(os.path.basename(self.epub_path))[0]
            output_m4b = os.path.join(output_dir, f"{base_name}.m4b")
            
            self.merge_audio(mp3_files, output_m4b)
            self.emit_log(f"Created M4B: {output_m4b}")

            # 5. Keep MP3s
            if self.keep_mp3s:
                mp3_export_dir = os.path.join(output_dir, f"{base_name}_MP3s")
                if not os.path.exists(mp3_export_dir):
                    os.makedirs(mp3_export_dir)
                for _, mp3_path in mp3_files:
                    shutil.copy(mp3_path, mp3_export_dir)
                self.emit_log(f"MP3s saved to: {mp3_export_dir}")

            self.emit_finished(True, "Conversion completed successfully!")
            
        finally:
            # ALWAYS close the event loop to prevent resource leaks
            loop.close()
            self.emit_log("[DEBUG] Event loop closed")

    def cleanup(self):
        if self.temp_dir and os.path.exists(self.temp_dir):
            try:
                shutil.rmtree(self.temp_dir, ignore_errors=True)
                self.emit_log(f"Cleaned up temp dir: {self.temp_dir}")
            except Exception as e:
                self.emit_log(f"Error cleaning up: {e}")
        self.temp_dir = None

    def extract_text(self, file_path):
        ext = os.path.splitext(file_path)[1].lower()
        self.emit_log(f"[DEBUG] File extension: {ext}")
        
        if ext == '.epub':
            return self.extract_epub(file_path)
        elif ext == '.pdf':
            return self.extract_pdf(file_path)
        elif ext == '.docx':
            return self.extract_docx(file_path)
        elif ext in ['.txt', '.md']:
            return self.extract_text_file(file_path)
        elif ext in ['.mobi', '.azw3']:
            return self.extract_mobi(file_path)
        else:
            raise Exception(f"Unsupported file format: {ext}")

    def extract_epub(self, epub_path):
        self.emit_log("[DEBUG] Extracting EPUB...")
        book = epub.read_epub(epub_path)
        chapters = []
        
        # Iterate through items
        for item in book.get_items():
            if item.get_type() == ebooklib.ITEM_DOCUMENT:
                soup = BeautifulSoup(item.get_content(), 'html.parser')
                text = soup.get_text(separator=' ').strip()
                if len(text) > 100:  # Ignore tiny chapters
                    # Try to find a title
                    title = "Chapter"
                    h1 = soup.find('h1')
                    if h1:
                        title = h1.get_text().strip()
                    elif soup.find('h2'):
                        title = soup.find('h2').get_text().strip()
                    
                    chapters.append((title, text))
                    
        return chapters

    def extract_pdf(self, pdf_path):
        self.emit_log("[DEBUG] Extracting PDF...")
        import fitz  # PyMuPDF
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        
        # Simple chapter detection for PDF is hard, so we treat it as one big chapter
        # The smart splitter will handle breaking it down
        return [("Document", text)]

    def extract_docx(self, docx_path):
        self.emit_log("[DEBUG] Extracting DOCX...")
        import docx
        doc = docx.Document(docx_path)
        text = "\n".join([para.text for para in doc.paragraphs])
        return [("Document", text)]

    def extract_text_file(self, txt_path):
        self.emit_log("[DEBUG] Extracting TXT/MD...")
        with open(txt_path, 'r', encoding='utf-8') as f:
            text = f.read()
        return [("Document", text)]

    def extract_mobi(self, mobi_path):
        self.emit_log("[DEBUG] Extracting MOBI/AZW3...")
        # Requires 'calibre' or similar tool usually, but here we assume text extraction
        # Since we don't have a direct library, we might need to rely on external tools or simple parsing
        # For now, placeholder
        raise Exception("MOBI/AZW3 extraction requires external tools not yet integrated.")

    async def generate_tts(self, text, filepath, start_word_count, total_words, title=""):
        import edge_tts
        communicate = edge_tts.Communicate(text, self.voice, rate=f"{self.rate:+d}%", volume=f"{self.volume:+d}%")
        
        # Estimate words in this chunk for progress calculation
        # We'll use the WordBoundary events if available, otherwise we might not get updates
        # But most Edge voices support it.
        
        current_words = 0
        
        with open(filepath, "wb") as f:
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    f.write(chunk["data"])
                elif chunk["type"] == "WordBoundary":
                    # Update progress
                    current_words += 1
                    # Update every 50 words to avoid spamming the GUI too much but keep it fluid
                    if current_words % 50 == 0:
                        total_current = start_word_count + current_words
                        percent = int((total_current / total_words) * 100) if total_words > 0 else 0
                        msg = f"{total_current}/{total_words} mots"
                        self.emit_text(msg)
                        
                        # Emit progress for the bar
                        self.emit_progress(total_current, total_words, f"TTS: {title} ({percent}%)")
                        
        # Final update for this chapter
        return current_words

    def merge_audio(self, mp3_files, output_path):
        # Create file list for ffmpeg
        list_path = os.path.join(self.temp_dir, "files.txt")
        with open(list_path, 'w', encoding='utf-8') as f:
            for _, filepath in mp3_files:
                # Escape backslashes for FFmpeg
                safe_path = filepath.replace('\\', '/')
                f.write(f"file '{safe_path}'\n")
        
        cmd = [
            self.ffmpeg_path,
            "-f", "concat",
            "-safe", "0",
            "-i", list_path,
            "-c:a", "aac",
            "-b:a", "128k",
            "-y",
            output_path
        ]
        
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True,
            encoding='utf-8',
            errors='replace' # Handle potential encoding errors in ffmpeg output
        )
        
        # Capture output for debugging
        stdout, stderr = process.communicate()
        
        if process.returncode != 0:
            self.emit_log(f"FFmpeg Error Output:\n{stderr}")
            raise Exception(f"FFmpeg merge failed with code {process.returncode}")

    def split_text_smart(self, text, max_chars=5000):
        """Splits text into chunks respecting sentence boundaries."""
        chunks = []
        while len(text) > max_chars:
            # Find the last period/punctuation within the limit
            split_idx = -1
            for char in ['.', '!', '?', '\n']:
                idx = text.rfind(char, 0, max_chars)
                if idx > split_idx:
                    split_idx = idx
            
            if split_idx == -1:
                # No punctuation found, force split at space
                split_idx = text.rfind(' ', 0, max_chars)
            
            if split_idx == -1:
                # No space found, hard split
                split_idx = max_chars
            
            chunks.append(text[:split_idx+1].strip())
            text = text[split_idx+1:].strip()
        
        if text:
            chunks.append(text)
        return chunks
