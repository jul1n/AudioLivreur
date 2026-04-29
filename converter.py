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
                 on_status_change=None, keep_global_mp3=True, embed_text=True, on_images_callback=None,
                 meta_title=None, meta_artist=None, meta_album=None, manual_cover_path=None):
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
        
        self.on_images_callback = on_images_callback
        
        self.cover_path = manual_cover_path 
        self.manual_cover_set = (manual_cover_path is not None)
        self.meta_title = meta_title
        self.meta_artist = meta_artist
        self.meta_album = meta_album

    def emit_text(self, text):
        if self.text_callback:
            self.text_callback(text)

    def emit_images(self, images):
        if self.on_images_callback:
            self.on_images_callback(images)

    def scan_file(self):
        try:
            chapters = self.extract_text(self.epub_path)
            word_count = sum(len(text.split()) for _, text in chapters)
            
            # Extract metadata
            title = ""
            author = ""
            ext = os.path.splitext(self.epub_path)[1].lower()
            if ext == '.epub':
                try:
                    book = epub.read_epub(self.epub_path)
                    titles = book.get_metadata('DC', 'title')
                    if titles: title = titles[0][0]
                    authors = book.get_metadata('DC', 'creator')
                    if authors: author = authors[0][0]
                except: pass
            elif ext == '.pdf':
                try:
                    import fitz
                    doc = fitz.open(self.epub_path)
                    meta = doc.metadata
                    if meta.get('title'): title = meta.get('title')
                    if meta.get('author'): author = meta.get('author')
                except: pass
            
            if not title: title = os.path.splitext(os.path.basename(self.epub_path))[0]
            
            return len(chapters), word_count, title, author
        except Exception as e:
            return 0, 0, os.path.splitext(os.path.basename(self.epub_path))[0], ""

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
            self.cleanup() # Cleanup only on success
        except Exception as e:
            import traceback
            self.emit_log(traceback.format_exc())
            self.emit_finished(False, str(e))
            # No cleanup here to allow Resume mode or manual recovery

    def do_work(self):
        self.emit_log("[DEBUG] Starting conversion process...")
        self.emit_log(f"[DEBUG] File: {self.epub_path}")
        self.emit_log(f"[DEBUG] Using voice={self.voice}, rate={self.rate}, volume={self.volume}, parallel={self.max_parallel}")
        
        # 1. Local Temp Dir (calculated early for resume/edit)
        output_dir = os.path.dirname(self.epub_path)
        base_name = os.path.splitext(os.path.basename(self.epub_path))[0]
        self.temp_dir = os.path.join(output_dir, f".{base_name}_tmp")
        
        if not os.path.exists(self.temp_dir):
            os.makedirs(self.temp_dir)
            self.emit_log(f"Created local temp directory: {self.temp_dir}")
        
        # 2. Extract or Load Chapters
        chapters_cache_path = os.path.join(self.temp_dir, "chapters.json")
        chapters = []
        
        if os.path.exists(chapters_cache_path):
            try:
                import json
                with open(chapters_cache_path, 'r', encoding='utf-8') as f:
                    chapters_data = json.load(f)
                    # Convert list of lists back to list of tuples
                    chapters = [(c[0], c[1]) for c in chapters_data]
                self.emit_log(f"Loaded chapters from cache: {chapters_cache_path} (Manual edits detected)")
            except Exception as e:
                self.emit_log(f"[WARNING] Could not load chapters cache: {e}")
        
        if not chapters:
            self.emit_progress(0, 100, "Étape 1/3 : Extraction du texte...")
            self.emit_log("[DEBUG] Calling extract_text()...")
            chapters = self.extract_text(self.epub_path)
            self.emit_log(f"[DEBUG] Extraction complete. Found {len(chapters)} chapters.")
            
            # Save to cache for potential manual editing/reprise
            try:
                import json
                with open(chapters_cache_path, 'w', encoding='utf-8') as f:
                    json.dump(chapters, f, ensure_ascii=False, indent=2)
                self.emit_log(f"Saved chapters to cache: {chapters_cache_path}")
            except Exception as e:
                self.emit_log(f"[WARNING] Could not save chapters cache: {e}")
        
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
                    self.emit_finished(False, "Cancelled by user.")
                    return

                safe_title = "".join([c for c in title if c.isalnum() or c in (' ', '-', '_')]).strip()
                if not safe_title:
                    safe_title = f"Chapter_{i+1}"
                
                # Truncate title to avoid path too long error (WinError 206)
                max_title_len = 30
                safe_title = safe_title[:max_title_len]
                
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
                            time_str = f" (Reste : ~{int(remaining_seconds // 60)}m {int(remaining_seconds % 60)}s)"
                        elif elapsed > 5: # Only show seconds after initial burst
                            time_str = f" (Reste : ~{int(remaining_seconds)}s)"

                        # Final progress update for this item
                        percent = int((total_words_so_far / total_words) * 100) if total_words > 0 else 0
                        self.emit_progress(total_words_so_far, total_words, f"Étape 2/3 : {item['title']} ({percent}%){time_str}")
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
                self.emit_finished(False, "Cancelled by user.")
                return

            self.emit_progress(total_words, total_words, "Étape 3/3 : Fusion Finale en cours...")
            self.emit_log("Merging with FFmpeg...")
            
            output_dir = os.path.dirname(self.epub_path)
            base_name = os.path.splitext(os.path.basename(self.epub_path))[0]
            output_m4b = os.path.join(output_dir, f"{base_name}.m4b")
            
            # Generate metadata file for chapters (and global transcript)
            metadata_path = os.path.join(self.temp_dir, "metadata.txt")
            self.generate_metadata_file(mp3_files_with_durations, metadata_path, chapters)
            
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

    def find_cover_in_raw_epub(self, epub_path):
        try:
            import zipfile
            import re
            with zipfile.ZipFile(epub_path, 'r') as z:
                # Find .opf file
                opf_filename = None
                for name in z.namelist():
                    if name.endswith('.opf'):
                        opf_filename = name
                        break
                
                if opf_filename:
                    opf_content = z.read(opf_filename).decode('utf-8', errors='ignore')
                    
                    # 1. Look for <meta name="cover" content="COVER_ID" />
                    match = re.search(r'<meta[^>]*name=["\']cover["\'][^>]*content=["\']([^"\']+)["\']', opf_content, re.IGNORECASE)
                    if match:
                        cover_id = match.group(1)
                        # Find item with this ID
                        id_match = re.search(rf'<item[^>]*id=["\']{cover_id}["\'][^>]*href=["\']([^"\']+)["\']', opf_content, re.IGNORECASE)
                        if id_match:
                            return id_match.group(1)
                            
                    # 2. Look for properties="cover-image"
                    prop_match = re.search(r'<item[^>]*properties=["\'][^"\']*cover-image[^"\']*["\'][^>]*href=["\']([^"\']+)["\']', opf_content, re.IGNORECASE)
                    if prop_match:
                        return prop_match.group(1)
        except Exception as e:
            self.emit_log(f"[WARNING] Raw cover extraction failed: {e}")
        return None

    def extract_epub(self, epub_path):
        self.emit_log("[DEBUG] Extracting EPUB...")
        book = epub.read_epub(epub_path)
        chapters = []
        
        # Advanced Raw Extraction
        raw_cover_href = self.find_cover_in_raw_epub(epub_path)
        raw_cover_name = os.path.basename(raw_cover_href).lower() if raw_cover_href else None
        if raw_cover_name:
            self.emit_log(f"[DEBUG] Found raw cover href: {raw_cover_name}")

        
        # Try to find cover image using metadata
        cover_id = None
        # EPUB 2 cover detection
        cover_meta = book.get_metadata('OPF', 'cover')
        if cover_meta:
            cover_id = cover_meta[0][1].get('content')
            
        # Advanced HTML Extraction for Cover (Fallback)
        html_cover_name = None
        for item in book.get_items():
            if item.get_type() == ebooklib.ITEM_DOCUMENT:
                name = item.get_name().lower()
            if 'cover' in name or 'titlepage' in name:
                try:
                    soup = BeautifulSoup(item.get_content(), 'html.parser')
                    img = soup.find('img')
                    if img and img.get('src'):
                        html_cover_name = os.path.basename(img.get('src')).lower()
                        self.emit_log(f"[DEBUG] Found cover in HTML src: {html_cover_name}")
                        break
                except Exception as e:
                    self.emit_log(f"[WARNING] Failed to parse cover HTML: {e}")
                    
        # Iterate through items to collect content and all images
        all_images = []
        for item in book.get_items():
            name = item.get_name().lower()
            item_type = item.get_type()
            # Broad detection: check type OR extension (handles ITEM_COVER or mislabeled images)
            is_image = (item_type == ebooklib.ITEM_IMAGE) or \
                       (any(name.endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.webp']))
                       
            if item_type == ebooklib.ITEM_DOCUMENT:
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
            elif is_image:
                name = item.get_name().lower()
                is_cover = False
                
                # Check 1: ID matches cover metadata
                if cover_id and item.id == cover_id:
                    is_cover = True
                # Check 2: Properties contains 'cover-image' (EPUB 3)
                elif hasattr(item, 'properties') and 'cover-image' in item.properties:
                    is_cover = True
                # Check 3: Filename contains cover keywords
                elif not self.cover_path and any(k in name for k in ['cover', 'pochette', 'front', 'couv', 'pagetitre', 'title']):
                    is_cover = True
                # Check 4: Matches raw cover href
                elif raw_cover_name and raw_cover_name in name:
                    is_cover = True
                # Check 5: Matches HTML cover src
                elif html_cover_name and html_cover_name in name:
                    is_cover = True
                
                if is_cover and not self.cover_path:
                    ext = os.path.splitext(name)[1]
                    if ext in ['.jpg', '.jpeg', '.png']:
                        # Create a temp file for the cover
                        suffix = ext if ext else ".jpg"
                        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                            tmp.write(item.get_content())
                            if not self.manual_cover_set:
                                self.cover_path = tmp.name
                        self.emit_log(f"[DEBUG] Found and extracted cover image: {name}")
                
                # Always add to gallery
                all_images.append((item.get_name(), item.get_content()))
                    
        self.emit_images(all_images)
        return chapters

    def extract_pdf(self, pdf_path):
        self.emit_log("[DEBUG] Extracting PDF...")
        import fitz  # PyMuPDF
        doc = fitz.open(pdf_path)
        
        # Try to extract the first page as a cover image
        if len(doc) > 0 and not self.cover_path:
            try:
                page = doc.load_page(0)
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
                    pix.save(tmp.name)
                    self.cover_path = tmp.name
                    # Emit it to gallery
                    with open(tmp.name, 'rb') as f:
                        self.emit_images([("Cover.jpg", f.read())])
                self.emit_log(f"[DEBUG] Extracted PDF cover to {self.cover_path}")
            except Exception as e:
                self.emit_log(f"[WARNING] Failed to extract PDF cover: {e}")
                
        # Optimization: use list join for large text
        text_list = []
        for page in doc:
            text_list.append(page.get_text())
        text = "".join(text_list)
        
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
        
        # Use native edge-tts parameters
        rate_str = f"{self.rate:+d}%"
        vol_str = f"{self.volume:+d}%"
        
        for attempt in range(max_retries):
            try:
                # Resume feature: If file exists and has size, skip generation
                if os.path.exists(filepath) and os.path.getsize(filepath) > 1000:
                    self.emit_log(f"[INFO] Skipping '{title}' (already exists)")
                    # Simulate progress update
                    total_current = start_word_count + len(text.split())
                    self.emit_text(f"{total_current}/{total_words} mots")
                    return len(text.split())

                # If a cooldown is active, wait for it to clear
                if not self.cooldown_event.is_set():
                    self.emit_log(f"[INFO] Serveur surchargé, attente avant reprise...")
                    await self.cooldown_event.wait()

                # Check for cancellation
                if self.cancel_requested: return
                
                # Pass text directly with native edge-tts parameters
                communicate = edge_tts.Communicate(text, voice=self.voice, rate=rate_str, volume=vol_str)
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
            # Hide console window on Windows
            creationflags = 0
            if os.name == 'nt':
                creationflags = subprocess.CREATE_NO_WINDOW
                
            result = subprocess.run(cmd, capture_output=True, text=True, check=True, creationflags=creationflags)
            return float(result.stdout.strip())
        except Exception as e:
            self.emit_log(f"[WARNING] Could not get duration for {filepath}: {e}")
            return 0

    def generate_metadata_file(self, mp3_files_with_durations, metadata_path, chapters=None):
        """Generate FFmpeg metadata file with chapters and global metadata."""
        with open(metadata_path, 'w', encoding='utf-8') as f:
            f.write(";FFMETADATA1\n")
            
            # Global Metadata (Transcript)
            if self.embed_text and chapters:
                full_text = "\n\n".join([f"[{title}]\n{text}" for title, text in chapters])
                # Escape backslashes and newlines for FFmetadata format
                safe_text = full_text.replace('\\', '\\\\').replace('\n', '\\\n')
                f.write(f"synopsis={safe_text}\n")
            
            # Global Metadata Tags
            if self.meta_title:
                f.write(f"title={self.meta_title.replace('=', r'\=')}\n")
            if self.meta_artist:
                f.write(f"artist={self.meta_artist.replace('=', r'\=')}\n")
                f.write(f"author={self.meta_artist.replace('=', r'\=')}\n")
                f.write(f"composer={self.meta_artist.replace('=', r'\=')}\n")
            if self.meta_album:
                f.write(f"album={self.meta_album.replace('=', r'\=')}\n")
            else:
                f.write(f"album={self.meta_title.replace('=', r'\=')}\n")
            
            f.write(f"genre=Audiobook\n")
            f.write(f"date=2026\n")
            f.write(f"encoder=AudioLivreur\n")
            
            current_time_ms = 0
            for title, filepath, duration in mp3_files_with_durations:
                duration_ms = int(duration * 1000)
                if duration_ms <= 0: continue
                
                f.write("[CHAPTER]\n")
                f.write("TIMEBASE=1/1000\n")
                f.write(f"START={current_time_ms}\n")
                f.write(f"END={current_time_ms + duration_ms}\n")
                # Clean title for metadata
                clean_title = title.replace('=', r'\=').replace(';', r'\;').replace('#', r'\#').replace('\\', r'\\')
                f.write(f"title={clean_title}\n")
                current_time_ms += duration_ms

    def merge_audio(self, mp3_files, output_path, metadata_path=None, chapters=None, is_mp3=False):
        # Create file list for ffmpeg with relative paths for better compatibility
        list_path = os.path.join(self.temp_dir, f"files_{'mp3' if is_mp3 else 'm4b'}.txt")
        with open(list_path, 'w', encoding='utf-8') as f:
            for _, filepath in mp3_files:
                # Use filename only (relative to the list file location in temp_dir)
                rel_path = os.path.basename(filepath)
                # Escape single quotes for FFmpeg concat format
                safe_path = rel_path.replace("'", "'\\''")
                f.write(f"file '{safe_path}'\n")
                
        # [AUDIT] Log the content of the list file to verify it's not empty
        try:
            with open(list_path, 'r', encoding='utf-8') as f:
                content = f.read()
                self.emit_log(f"[AUDIT] Content of {os.path.basename(list_path)}:\n{content}")
        except Exception as e:
            self.emit_log(f"[AUDIT ERROR] Could not read list file: {e}")
            
        cmd = [
            self.ffmpeg_path,
            "-f", "concat",
            "-safe", "0",
            "-i", os.path.basename(list_path) # Use basename since we'll set cwd
        ]
        
        # Add metadata file if provided
        if metadata_path and os.path.exists(metadata_path):
            cmd.extend(["-i", os.path.basename(metadata_path)])
            
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
                "-c:v", "mjpeg", 
                "-pix_fmt", "yuvj420p", # Force compatible colorspace for players
                "-disposition:v:0", "attached_pic"
            ])
            
        if metadata_input_idx != -1:
            cmd.extend(["-map_metadata", str(metadata_input_idx)])
            
        # Ensure output path is absolute since we change cwd
        abs_output_path = os.path.abspath(output_path)
        cmd.extend(["-y", abs_output_path])
        
        self.emit_log(f"[DEBUG] FFmpeg Command (CWD={self.temp_dir}): {' '.join(cmd)}")
        
        # Hide console window on Windows
        creationflags = 0
        if os.name == 'nt':
            creationflags = subprocess.CREATE_NO_WINDOW
            
        process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, 
                                   universal_newlines=True, encoding='utf-8', errors='ignore',
                                   cwd=self.temp_dir, # CRITICAL: set CWD to temp dir for relative paths
                                   creationflags=creationflags)
        
        # Capture output for debugging
        stdout, _ = process.communicate()
        
        # [AUDIT] Always log FFmpeg output for debugging this specific issue
        self.emit_log(f"[AUDIT] FFmpeg Output (Return Code: {process.returncode}):\n{stdout}")
        
        if process.returncode != 0:
            self.emit_log(f"[ERROR] FFmpeg failed with code {process.returncode}")
            raise Exception(f"FFmpeg merge failed with code {process.returncode}")
            
        # Verify output file
        if not os.path.exists(output_path) or os.path.getsize(output_path) < 1000:
            self.emit_log(f"[ERROR] Output file is missing or too small: {output_path}")
            raise Exception("FFmpeg failed to generate a valid output file.")

    def split_text_smart(self, text, max_chars=5000):
        """Splits text into chunks respecting sentence boundaries, optimized for performance."""
        chunks = []
        start = 0
        text_len = len(text)
        
        while start < text_len:
            if text_len - start <= max_chars:
                chunks.append(text[start:].strip())
                break
                
            end = start + max_chars
            # Find the last period/punctuation within the limit
            split_idx = -1
            for char in ['.', '!', '?', '\n']:
                idx = text.rfind(char, start, end)
                if idx > split_idx:
                    split_idx = idx
            
            if split_idx == -1:
                # No punctuation found, force split at space
                split_idx = text.rfind(' ', start, end)
            
            if split_idx == -1:
                # No space found, hard split
                split_idx = end
            
            chunks.append(text[start:split_idx+1].strip())
            start = split_idx + 1
            
        return chunks
