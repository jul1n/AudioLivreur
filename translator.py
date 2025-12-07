import os
import shutil
import tempfile
import asyncio
import time
from deep_translator import GoogleTranslator
import ebooklib
from ebooklib import epub
from bs4 import BeautifulSoup

class Translator:
    def __init__(self, file_path, target_lang, progress_callback=None, log_callback=None, finished_callback=None):
        self.file_path = file_path
        self.target_lang = target_lang
        self.progress_callback = progress_callback
        self.log_callback = log_callback
        self.finished_callback = finished_callback
        self.cancel_requested = False
        self.temp_dir = None

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

    def do_work(self):
        self.emit_log(f"[DEBUG] Starting translation of {self.file_path} to {self.target_lang}")
        
        # 1. Extract Text & Metadata
        self.emit_progress(0, 100, "Extracting text and metadata...")
        data = self.extract_data(self.file_path)
        
        if not data or not data.get('chapters'):
            raise Exception("No text found in file.")

        chapters = data['chapters']
        metadata = data['metadata']
        cover_data = data.get('cover')

        total_chars = sum(len(text) for _, text in chapters)
        self.emit_log(f"[DEBUG] Total characters to translate: {total_chars}")

        # 2. Translate
        translated_chapters = []
        chars_processed = 0
        
        # Map generic codes to Google Translator codes if needed
        lang_code = self.target_lang.split('-')[0] if '-' in self.target_lang else self.target_lang
        self.emit_log(f"[DEBUG] Target language code resolved to: {lang_code}")
        
        translator = GoogleTranslator(source='auto', target=lang_code)
        
        # Translate Metadata (Title)
        translated_metadata = metadata.copy()
        try:
            if metadata.get('title'):
                translated_metadata['title'] = translator.translate(metadata['title'])
                self.emit_log(f"[DEBUG] Translated title: {translated_metadata['title']}")
        except Exception as e:
            self.emit_log(f"[WARN] Failed to translate title: {e}")

        for i, (title, text) in enumerate(chapters):
            if self.cancel_requested:
                self.emit_finished(False, "Cancelled")
                return

            self.emit_log(f"Translating chapter {i+1}/{len(chapters)}: {title}")
            
            # Translate Title
            try:
                trans_title = translator.translate(title)
            except:
                trans_title = title

            # Translate Content
            chunks = self.split_text(text, 4500)
            self.emit_log(f"[DEBUG] Chapter split into {len(chunks)} chunks")
            trans_chunks = []
            
            for chunk in chunks:
                if self.cancel_requested: return
                try:
                    # Retry logic
                    for attempt in range(3):
                        try:
                            self.emit_log(f"[DEBUG] Translating chunk {len(trans_chunks)+1}/{len(chunks)} (Attempt {attempt+1})")
                            trans_chunk = translator.translate(chunk)
                            trans_chunks.append(trans_chunk)
                            break
                        except Exception as e:
                            if attempt == 2: raise e
                            time.sleep(1)
                    
                    chars_processed += len(chunk)
                    percent = int((chars_processed / total_chars) * 90) # Scale to 90%
                    self.emit_progress(percent, 100, f"Translating... ({percent}%)")
                    
                    # Small delay to be nice to the API
                    time.sleep(0.1)
                    
                except Exception as e:
                    self.emit_log(f"[ERROR] Failed to translate chunk: {e}")
                    trans_chunks.append(chunk) # Fallback to original

            translated_text = "\n".join(trans_chunks)
            translated_chapters.append((trans_title, translated_text))

        # 3. Save Output
        self.emit_progress(95, 100, "Saving file...")
        output_path = self.save_epub(translated_chapters, translated_metadata, cover_data, lang_code)
        
        self.emit_progress(100, 100, "Done!")
        self.emit_finished(True, f"Translation complete: {output_path}")

    def split_text(self, text, max_chars):
        chunks = []
        while len(text) > max_chars:
            split_idx = text.rfind('.', 0, max_chars)
            if split_idx == -1:
                split_idx = text.rfind(' ', 0, max_chars)
            if split_idx == -1:
                split_idx = max_chars
            
            chunks.append(text[:split_idx+1])
            text = text[split_idx+1:]
        if text:
            chunks.append(text)
        return chunks

    def extract_data(self, file_path):
        ext = os.path.splitext(file_path)[1].lower()
        if ext == '.epub':
            book = epub.read_epub(file_path)
            
            # Extract Metadata
            metadata = {
                'title': book.get_metadata('DC', 'title')[0][0] if book.get_metadata('DC', 'title') else "Unknown Title",
                'creator': book.get_metadata('DC', 'creator')[0][0] if book.get_metadata('DC', 'creator') else "Unknown Author",
            }
            
            # Extract Cover
            cover_data = None
            # Try to find cover item
            cover_item = None
            # Method 1: Check metadata for cover
            try:
                cover_id = book.get_metadata('OPF', 'cover')
                if cover_id:
                    cover_item = book.get_item_with_id(cover_id[0][0])
            except: pass
            
            # Method 2: Iterate items
            if not cover_item:
                for item in book.get_items():
                    if item.get_type() == ebooklib.ITEM_IMAGE and 'cover' in item.get_name().lower():
                        cover_item = item
                        break
            
            if cover_item:
                cover_data = {
                    'name': cover_item.get_name(),
                    'content': cover_item.get_content(),
                    'media_type': cover_item.media_type
                }

            # Extract Chapters
            chapters = []
            for item in book.get_items():
                if item.get_type() == ebooklib.ITEM_DOCUMENT:
                    soup = BeautifulSoup(item.get_content(), 'html.parser')
                    text = soup.get_text(separator='\n').strip()
                    if len(text) > 50:
                        title = "Chapter"
                        h1 = soup.find('h1')
                        if h1: title = h1.get_text().strip()
                        chapters.append((title, text))
            
            return {
                'chapters': chapters,
                'metadata': metadata,
                'cover': cover_data
            }
        else:
            raise Exception("Only EPUB is supported for translation currently.")

    def save_epub(self, chapters, metadata, cover_data, lang):
        book = epub.EpubBook()
        
        base_name = os.path.splitext(os.path.basename(self.file_path))[0]
        book.set_identifier(f'{base_name}_{lang}')
        book.set_title(metadata.get('title', 'Unknown Title'))
        book.set_language(lang)
        book.add_author(metadata.get('creator', 'Unknown Author'))
        
        # Add Cover
        if cover_data:
            book.set_cover(cover_data['name'], cover_data['content'])
        
        epub_chapters = []
        for i, (title, text) in enumerate(chapters):
            c = epub.EpubHtml(title=title, file_name=f'chap_{i+1}.xhtml', lang=lang)
            # Basic HTML formatting
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
        
        style = 'body { font-family: Helvetica, Arial, sans-serif; }'
        nav_css = epub.EpubItem(uid="style_nav", file_name="style/nav.css", media_type="text/css", content=style)
        book.add_item(nav_css)
        
        book.spine = ['nav'] + epub_chapters
        if cover_data:
            # Ensure cover is in spine if set_cover doesn't do it automatically (it usually does add a cover page)
            pass 
        
        output_path = os.path.join(os.path.dirname(self.file_path), f"{base_name}_{lang}.epub")
        epub.write_epub(output_path, book, {})
        return output_path
