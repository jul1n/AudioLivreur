import os
import shutil
import tempfile
import asyncio
import time
import json
import re
import hashlib
from concurrent.futures import ThreadPoolExecutor
from deep_translator import GoogleTranslator
import ebooklib
from ebooklib import epub
from bs4 import BeautifulSoup
import fitz
import docx
import mobi
import logging

class TranslationCache:
    def __init__(self, cache_file):
        self.cache_file = Path(cache_file)
        self.cache_file.parent.mkdir(parents=True, exist_ok=True)
        self.data = {}
        self.load()

    def load(self):
        if self.cache_file.exists():
            try:
                with open(self.cache_file, 'r', encoding='utf-8') as f:
                    self.data = json.load(f)
            except:
                self.data = {}

    def save(self):
        try:
            with open(self.cache_file, 'w', encoding='utf-8') as f:
                json.dump(self.data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logging.error(f"Failed to save cache: {e}")

    def get_key(self, text, target_lang):
        # Use MD5 of text to avoid huge keys
        hash_obj = hashlib.md5(text.encode('utf-8'))
        return f"{target_lang}_{hash_obj.hexdigest()}"

    def get(self, text, target_lang):
        key = self.get_key(text, target_lang)
        return self.data.get(key)

    def set(self, text, target_lang, translated):
        key = self.get_key(text, target_lang)
        self.data[key] = translated
        # Save every few updates or at the end
        if len(self.data) % 10 == 0:
            self.save()

class Translator:
    def __init__(self, file_path, target_lang, progress_callback=None, log_callback=None, finished_callback=None):
        self.file_path = file_path
        self.target_lang = target_lang
        self.progress_callback = progress_callback
        self.log_callback = log_callback
        self.finished_callback = finished_callback
        self.cancel_requested = False
        
        # Setup Cache
        from pathlib import Path
        app_dir = Path(os.path.dirname(os.path.abspath(__file__)))
        self.cache = TranslationCache(app_dir / "cache" / "translations.json")

    def emit_log(self, msg):
        if self.log_callback:
            self.log_callback(msg)

    def emit_progress(self, current, total, msg):
        if self.progress_callback:
            self.progress_callback(current, total, msg)

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

    def translate_chunk(self, chunk, lang_code):
        if not chunk.strip(): return ""
        
        # Check Cache
        cached = self.cache.get(chunk, lang_code)
        if cached:
            return cached
            
        # Create a local translator for this thread
        translator = GoogleTranslator(source='auto', target=lang_code)
        
        # Translate with retry
        for attempt in range(3):
            try:
                # Add a small jitter to avoid perfect synchronization of threads
                time.sleep(attempt * 0.5) 
                result = translator.translate(chunk)
                if result:
                    self.cache.set(chunk, lang_code, result)
                    return result
            except Exception as e:
                if attempt == 2:
                    logging.error(f"Translation failed for chunk: {e}")
                    return chunk # Fallback
        return chunk

    def do_work(self):
        self.emit_log(f"[v0.6] Starting optimized translation of {self.file_path}")
        
        # 1. Extract Data
        self.emit_progress(0, 100, "Extracting text...")
        data = self.extract_data(self.file_path)
        if not data or not data.get('chapters'):
            raise Exception("No text found in file.")

        chapters = data['chapters']
        metadata = data['metadata']
        cover_data = data.get('cover')
        
        lang_code = self.target_lang.split('-')[0] if '-' in self.target_lang else self.target_lang
        translator = GoogleTranslator(source='auto', target=lang_code)

        # 2. Preparation
        all_chunks = []
        for title, text in chapters:
            chapter_chunks = self.split_text_smart(text, 4000)
            all_chunks.append({
                'title': title,
                'chunks': chapter_chunks,
                'translated_chunks': [None] * len(chapter_chunks)
            })

        total_chunks = sum(len(c['chunks']) for c in all_chunks)
        self.emit_log(f"Total chunks to process: {total_chunks}")

        # 3. Parallel Translation
        from concurrent.futures import as_completed
        processed_count = 0
        with ThreadPoolExecutor(max_workers=3) as executor: 
            # Submit all chunks
            future_to_chunk = {}
            for ch_idx, chapter in enumerate(all_chunks):
                for chunk_idx, chunk in enumerate(chapter['chunks']):
                    future = executor.submit(self.translate_chunk, chunk, lang_code)
                    future_to_chunk[future] = (ch_idx, chunk_idx)

            for future in as_completed(future_to_chunk):
                if self.cancel_requested: break
                
                ch_idx, chunk_idx = future_to_chunk[future]
                try:
                    result = future.result()
                    all_chunks[ch_idx]['translated_chunks'][chunk_idx] = result
                except Exception as e:
                    self.emit_log(f"Error in chunk {ch_idx}-{chunk_idx}: {e}")
                
                processed_count += 1
                percent = int((processed_count / total_chunks) * 90)
                self.emit_progress(percent, 100, f"Translating... ({processed_count}/{total_chunks})")

        if self.cancel_requested:
            self.emit_finished(False, "Cancelled")
            return

        # 4. Reconstruct Chapters
        translated_chapters = []
        # Title translation can also be cached, but for simplicity we do it here
        # It's better to do it in parallel too if there are many chapters
        for chapter in all_chunks:
            trans_title = self.translate_chunk(chapter['title'], lang_code)
            trans_text = "\n".join([c for c in chapter['translated_chunks'] if c])
            translated_chapters.append((trans_title, trans_text))

        # 5. Save and Cleanup
        self.cache.save()
        self.emit_progress(95, 100, "Saving Output...")
        output_path = self.save_epub(translated_chapters, metadata, cover_data, lang_code)
        
        self.emit_progress(100, 100, "Done!")
        self.emit_finished(True, f"File saved: {os.path.basename(output_path)}")

    def split_text_smart(self, text, max_chars):
        if len(text) <= max_chars: return [text]
        
        chunks = []
        current_chunk = ""
        paragraphs = text.split('\n')
        
        for para in paragraphs:
            if not para.strip(): continue
            if len(current_chunk) + len(para) + 1 <= max_chars:
                current_chunk += (para + '\n')
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                    current_chunk = ""
                
                if len(para) > max_chars:
                    # Split by sentences
                    sentences = re.split(r'(?<=[.!?]) +', para)
                    for sentence in sentences:
                        if len(current_chunk) + len(sentence) + 1 <= max_chars:
                            current_chunk += (sentence + ' ')
                        else:
                            if current_chunk:
                                chunks.append(current_chunk.strip())
                            current_chunk = sentence + ' '
                else:
                    current_chunk = para + '\n'
                    
        if current_chunk:
            chunks.append(current_chunk.strip())
        return chunks

    def extract_data(self, file_path):
        ext = os.path.splitext(file_path)[1].lower()
        metadata = {'title': os.path.splitext(os.path.basename(file_path))[0], 'creator': "AudioLivreur"}
        cover_data = None
        chapters = []

        if ext == '.epub':
            book = epub.read_epub(file_path)
            metadata['title'] = book.get_metadata('DC', 'title')[0][0] if book.get_metadata('DC', 'title') else metadata['title']
            # Extract Chapters
            for item in book.get_items():
                if item.get_type() == ebooklib.ITEM_DOCUMENT:
                    soup = BeautifulSoup(item.get_content(), 'html.parser')
                    text = soup.get_text(separator='\n').strip()
                    if len(text) > 50:
                        title = "Chapter"
                        h1 = soup.find(['h1', 'h2', 'h3'])
                        if h1: title = h1.get_text().strip()
                        chapters.append((title, text))
        elif ext == '.pdf':
            doc = fitz.open(file_path)
            text = "\n".join([page.get_text() for page in doc])
            chapters = [("Document", text)]
        elif ext == '.docx':
            doc = docx.Document(file_path)
            text = "\n".join([para.text for para in doc.paragraphs])
            chapters = [("Document", text)]
        elif ext in ['.txt', '.md']:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                text = f.read()
            chapters = [("Document", text)]
        else:
            raise Exception(f"Unsupported format: {ext}")
            
        return {'chapters': chapters, 'metadata': metadata, 'cover': cover_data}

    def save_epub(self, chapters, metadata, cover_data, lang):
        book = epub.EpubBook()
        base_name = os.path.splitext(os.path.basename(self.file_path))[0]
        book.set_title(f"{metadata.get('title', 'Unknown')} ({lang.upper()})")
        book.set_language(lang)
        
        epub_chapters = []
        for i, (title, text) in enumerate(chapters):
            c = epub.EpubHtml(title=title, file_name=f'chap_{i+1}.xhtml', lang=lang)
            html_content = f"<h1>{title}</h1>"
            for para in text.split('\n'):
                if para.strip():
                    html_content += f"<p>{para.strip()}</p>"
            c.content = html_content
            book.add_item(c)
            epub_chapters.append(c)
            
        book.toc = (epub_chapters)
        book.add_item(epub.EpubNcx())
        book.add_item(epub.EpubNav())
        book.spine = ['nav'] + epub_chapters
        
        output_path = os.path.join(os.path.dirname(self.file_path), f"{base_name}_{lang}.epub")
        epub.write_epub(output_path, book, {})
        return output_path
