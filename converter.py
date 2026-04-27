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
                 progress_callback=None, log_callback=None, finished_callback=None, text_callback=None,
                 on_status_change=None, keep_global_mp3=True, embed_text=True):
        self.epub_path = epub_path
        self.ffmpeg_path = ffmpeg_path
        self.voice = voice
        self.rate = rate
        self.volume = volume
        self.keep_mp3s = keep_mp3s
        self.keep_global_mp3 = keep_global_mp3
        self.embed_text = embed_text
        self.max_parallel = max_parallel
        self.cancel_requested = False
        self.pause_event = asyncio.Event()
        self.pause_event.set() # Start in non-paused state
        
        # Cooldown management
        self.cooldown_event = asyncio.Event()
        self.cooldown_event.set() # Set = No cooldown
        self.on_status_change = on_status_change
        
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

    def emit_status(self, color):
        if self.on_status_change:
            self.on_status_change(color)

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
        
        import time
        try:
            self.start_time = time.time()
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
                    # Wait if paused
                    await self.pause_event.wait()
                    
                    if self.cancel_requested: return None
                    
                    try:
                        self.emit_log(f"Generating: {item['title']}...")
                        # Pass title for progress updates
                        await self.generate_tts(item['text'], item['filepath'], total_words_so_far, total_words, item['title'])
                        
                        duration = self.get_audio_duration(item['filepath'])
                        completed_tasks += 1
                        
                        # Update word count safely
                        total_words_so_far += item['word_count']
                        
                        # Calculate time remaining
                        elapsed = time.time() - self.start_time
                        speed = total_words_so_far / elapsed if elapsed > 0 else 0
                        remaining_words = total_words - total_words_so_far
                        remaining_seconds = remaining_words / speed if speed > 0 else 0
                        
                        time_str = ""
                        if remaining_seconds > 60:
                            time_str = f" (~{int(remaining_seconds // 60)}m {int(remaining_seconds % 60)}s)"
                        else:
                            time_str = f" (~{int(remaining_seconds)}s)"

                        # Final progress update for this item
                        percent = int((total_words_so_far / total_words) * 100) if total_words > 0 else 0
                        self.emit_progress(total_words_so_far, total_words, f"TTS: {item['title']} ({percent}%){time_str}")
                        self.emit_text(f"{total_words_so_far}/{total_words} mots")
                        
                        return (item['title'], item['filepath'], duration)
                    except Exception as e:
                        self.emit_log(f"Error in {item['title']}: {e}")
                        raise e

            tasks = [process_item(item) for item in processing_queue]
            results = loop.run_until_complete(asyncio.gather(*tasks))
            
            # Filter out None results (cancelled) and sort by filename to ensure correct order
            mp3_files_with_durations = sorted([r for r in results if r], key=lambda x: x[1])
            mp3_files = [(r[0], r[1]) for r in mp3_files_with_durations]

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
            
            # Generate metadata file for chapters
            metadata_path = os.path.join(self.temp_dir, "metadata.txt")
            self.generate_metadata_file(mp3_files_with_durations, metadata_path)
            
            self.merge_audio(mp3_files, output_m4b, metadata_path, chapters)
            self.emit_log(f"Created M4B: {output_m4b}")

            # 4.5 Global MP3
            if self.keep_global_mp3:
                output_mp3 = os.path.join(output_dir, f"{base_name}.mp3")
                self.merge_audio(mp3_files, output_mp3, metadata_path, chapters, is_mp3=True)
                self.emit_log(f"Created global MP3: {output_mp3}")
                
            # 4.6 Transcript file
            if self.embed_text:
                transcript_path = os.path.join(output_dir, f"{base_name}_transcript.txt")
                with open(transcript_path, 'w', encoding='utf-8') as f:
                    for title, text in chapters:
                        f.write(f"=== {title} ===\n\n{text}\n\n")
                self.emit_log(f"Transcript saved to: {transcript_path}")

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
        
        # Try to find cover image using metadata
        cover_id = None
        # EPUB 2 cover detection
        cover_meta = book.get_metadata('OPF', 'cover')
        if cover_meta:
            cover_id = cover_meta[0][1].get('content')
            
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
            
            # Extract cover image
            elif item.get_type() == ebooklib.ITEM_IMAGE:
                name = item.get_name().lower()
                is_cover = False
                
                # Check 1: ID matches cover metadata
                if cover_id and item.id == cover_id:
                    is_cover = True
                # Check 2: Properties contains 'cover-image' (EPUB 3)
                elif hasattr(item, 'properties') and 'cover-image' in item.properties:
                    is_cover = True
                # Check 3: Filename contains cover keywords
                elif not self.cover_path and ('cover' in name or 'pochette' in name or 'front' in name):
                    is_cover = True
                
                if is_cover and not self.cover_path:
                    ext = os.path.splitext(name)[1]
                    if ext in ['.jpg', '.jpeg', '.png']:
                        # Create a temp file for the cover
                        suffix = ext if ext else ".jpg"
                        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                            tmp.write(item.get_content())
                            self.cover_path = tmp.name
                        self.emit_log(f"[DEBUG] Found and extracted cover image: {name}")
                    
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
        import mobi
        import shutil
        from bs4 import BeautifulSoup
        
        tempdir = None
        try:
            # Unpack the mobi file
            tempdir, filepath = mobi.extract(mobi_path)
            
            # Read the extracted content (usually HTML)
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            # Use BeautifulSoup to get clean text
            soup = BeautifulSoup(content, 'html.parser')
            text = soup.get_text(separator='\n').strip()
            
            return [("Document", text)]
            
        except Exception as e:
            self.emit_log(f"[ERROR] MOBI extraction failed: {e}")
            raise Exception(f"Failed to extract MOBI: {e}")
        finally:
            # Clean up the temporary directory
            if tempdir and os.path.exists(tempdir):
                shutil.rmtree(tempdir, ignore_errors=True)

    async def generate_tts(self, text, filepath, start_word_count, total_words, title=""):
        import edge_tts
        import xml.etree.ElementTree as ET
        
        max_retries = 3
        retry_delay = 2  # seconds
        
        # Extract language code from voice (e.g., fr-FR-RemyMultilingualNeural -> fr-FR)
        lang_code = "-".join(self.voice.split("-")[:2])
        
        # Escape text for XML
        def xml_escape(t):
            return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;").replace("'", "&apos;")
        
        safe_text = xml_escape(text)
        
        # Construct SSML to force language and handle prosody
        ssml = f'<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="{lang_code}">' \
               f'<voice name="{self.voice}">' \
               f'<prosody rate="{self.rate:+d}%" volume="{self.volume:+d}%">' \
               f'{safe_text}' \
               f'</prosody></voice></speak>'
        
        for attempt in range(max_retries):
            try:
                # If a cooldown is active, wait for it to clear
                if not self.cooldown_event.is_set():
                    self.emit_log(f"[INFO] Serveur surchargé, attente avant reprise...")
                    await self.cooldown_event.wait()

                # Check for cancellation
                if self.cancel_requested: return
                
                # Use SSML instead of plain text
                communicate = edge_tts.Communicate(ssml)
                current_words = 0
                
                with open(filepath, "wb") as f:
                    async for chunk in communicate.stream():
                        if self.cancel_requested:
                            f.close()
                            if os.path.exists(filepath): os.remove(filepath)
                            return
                            
                        if chunk["type"] == "audio":
                            f.write(chunk["data"])
                        elif chunk["type"] == "WordBoundary":
                            # Update progress
                            current_words += 1
                            # Update every 50 words
                            if current_words % 50 == 0:
                                total_current = start_word_count + current_words
                                percent = int((total_current / total_words) * 100) if total_words > 0 else 0
                                msg = f"{total_current}/{total_words} mots"
                                self.emit_text(msg)
                                self.emit_progress(total_current, total_words, f"TTS: {title} ({percent}%)")
                
                # If we get here, it worked! Restore green light
                self.emit_status("green")
                self.cooldown_event.set()
                return current_words
                
            except Exception as e:
                self.emit_status("orange")
                # Trigger global cooldown to avoid spamming
                self.cooldown_event.clear()
                
                if attempt < max_retries - 1:
                    wait_time = retry_delay * (attempt + 1) * 2 # Exponential backoff
                    self.emit_log(f"[WARNING] Erreur serveur pour '{title}'. Nouvelle tentative dans {wait_time}s... ({e})")
                    await asyncio.sleep(wait_time)
                    # We only restore the event after waiting
                    self.cooldown_event.set()
                else:
                    self.emit_status("red")
                    self.emit_log(f"[ERROR] Échec définitif pour '{title}' après {max_retries} tentatives : {e}")
                    raise e

    def get_audio_duration(self, filepath):
        """Get duration of audio file using ffprobe."""
        ffprobe_path = self.ffmpeg_path.replace('ffmpeg.exe', 'ffprobe.exe').replace('ffmpeg', 'ffprobe')
        cmd = [
            ffprobe_path,
            "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            filepath
        ]
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            return float(result.stdout.strip())
        except Exception as e:
            self.emit_log(f"[WARNING] Could not get duration for {filepath}: {e}")
            return 0

    def generate_metadata_file(self, mp3_files_with_durations, metadata_path):
        """Generate FFmpeg metadata file with chapters."""
        with open(metadata_path, 'w', encoding='utf-8') as f:
            f.write(";FFMETADATA1\n")
            current_time_ms = 0
            for title, filepath, duration in mp3_files_with_durations:
                duration_ms = int(duration * 1000)
                if duration_ms <= 0: continue
                
                f.write("[CHAPTER]\n")
                f.write("TIMEBASE=1/1000\n")
                f.write(f"START={current_time_ms}\n")
                f.write(f"END={current_time_ms + duration_ms}\n")
                # Clean title for metadata
                clean_title = title.replace('=', '\=').replace(';', '\;').replace('#', '\#').replace('\\', '\\\\')
                f.write(f"title={clean_title}\n")
                current_time_ms += duration_ms

    def merge_audio(self, mp3_files, output_path, metadata_path=None, chapters=None, is_mp3=False):
        # Create file list for ffmpeg
        list_path = os.path.join(self.temp_dir, f"files_{'mp3' if is_mp3 else 'm4b'}.txt")
        with open(list_path, 'w', encoding='utf-8') as f:
            for _, filepath in mp3_files:
                # Escape backslashes for FFmpeg
                safe_path = filepath.replace('\\', '/')
                f.write(f"file '{safe_path}'\n")
        
        cmd = [
            self.ffmpeg_path,
            "-f", "concat",
            "-safe", "0",
            "-i", list_path
        ]
        
        # Add metadata file if provided
        if metadata_path and os.path.exists(metadata_path):
            cmd.extend(["-i", metadata_path])
            
        # Add cover image if found
        if self.cover_path and os.path.exists(self.cover_path):
            cmd.extend(["-i", self.cover_path])
            
        if is_mp3:
            cmd.extend([
                "-c:a", "libmp3lame",
                "-b:a", "128k",
                "-id3v2_version", "3"
            ])
        else:
            cmd.extend([
                "-c:a", "aac",
                "-b:a", "128k"
            ])
        
        # Map streams carefully based on input count
        audio_input = "0:a"
        metadata_input_idx = -1
        cover_input_idx = -1
        
        current_idx = 1
        if metadata_path and os.path.exists(metadata_path):
            metadata_input_idx = current_idx
            current_idx += 1
        if self.cover_path and os.path.exists(self.cover_path):
            cover_input_idx = current_idx
            current_idx += 1
            
        cmd.extend(["-map", audio_input])
        
        if cover_input_idx != -1:
            cmd.extend([
                "-map", f"{cover_input_idx}:v",
                "-c:v", "copy",
                "-disposition:v:0", "attached_pic"
            ])
            
        if metadata_input_idx != -1:
            cmd.extend(["-map_metadata", str(metadata_input_idx)])
            
        # Add Lyrics/Text if requested
        if self.embed_text and chapters:
            full_text = "\n\n".join([f"[{title}]\n{text}" for title, text in chapters])
            # For MP3 we use 'comment' or 'lyrics', for M4B 'description' or 'lyrics'
            if is_mp3:
                cmd.extend(["-metadata", f"comment={full_text[:32000]}"]) # Limit size for safety
            else:
                cmd.extend(["-metadata", f"description={full_text[:32000]}"])
                cmd.extend(["-metadata", f"synopsis={full_text[:32000]}"])
            
        cmd.extend(["-y", output_path])
        
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True,
            encoding='utf-8',
            errors='replace'
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
