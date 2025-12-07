import os
import threading
import asyncio
import sys
import logging
from logging.handlers import RotatingFileHandler
import tkinter as tk
import tkinter.messagebox
from tkinter import filedialog, ttk
import customtkinter as ctk
from tkinterdnd2 import DND_FILES, TkinterDnD
from PIL import Image
from converter import Converter
from translator import Translator
import shutil
import math
import time
from pathlib import Path

# Get the directory where the script is located
if getattr(sys, 'frozen', False):
    # Running as compiled executable
    SCRIPT_DIR = Path(sys._MEIPASS)
else:
    # Running as script
    SCRIPT_DIR = Path(__file__).parent

# Helper function to detect FFmpeg installation
def get_default_ffmpeg_path():
    """Detect FFmpeg installation on the system."""
    # Try system PATH first
    ffmpeg = shutil.which('ffmpeg')
    if ffmpeg:
        return ffmpeg
    
    # Try common Windows locations
    if os.name == 'nt':
        common_paths = [
            r"C:\Users\Julien\Downloads\ffmpeg-8.0.1-full_build\ffmpeg-8.0.1-full_build\bin\ffmpeg.exe",
            r"C:\ffmpeg\bin\ffmpeg.exe",
            r"C:\Program Files\ffmpeg\bin\ffmpeg.exe",
            Path.home() / "Downloads" / "ffmpeg" / "bin" / "ffmpeg.exe",
        ]
        for path in common_paths:
            if Path(path).exists():
                return str(path)
    
    # Return empty string if not found
    return ""

# Theme Configuration
PINK_COLOR = "#e2007a"
LIGHT_BG = "#ffffff"
TEXT_COLOR = "#000000"
FONT_FAMILY = "Segoe UI"

ctk.set_appearance_mode("Light")
ctk.set_default_color_theme("blue") 

# Localization
LANGUAGES = {
    "en": {
        "name": "English", "title": "AudioLivreur", "by": "by Julien", 
        "drop_text": "Drag & Drop File here\n(EPUB, PDF, DOCX, MOBI...)", 
        "ready": "Ready", "converting": "Converting...", "success": "Done!", "error": "Error", 
        "start": "Start Conversion", "cancel": "Cancel", "close": "Close", "settings": "Settings", 
        "voice": "Voice:", "rate": "Rate:", "volume": "Volume:", "ffmpeg": "FFmpeg Path:", 
        "keep_mp3": "Auto-save MP3s", "open_folder": "Open Folder", "export_merged": "Export Merged", 
        "export_title": "Save Merged Audio As", "analyzing": "Analyzing...", 
        "file_info": "Chapters: {} | Words: {}", "parallel": "Parallel:", "download_ffmpeg": "⬇️ Download FFmpeg", 
        "loading_voices": "Loading voices...", "no_voices": "No voices found",
        "tab_trans": "Translation", "tab_conv": "Conversion", "target_lang": "Target Language:", 
        "translate": "Translate", "init": "Initializing...",
        "lang_names": {
            "en": "English", "fr": "French", "es": "Spanish", "de": "German", "it": "Italian", 
            "pt": "Portuguese", "zh": "Chinese", "ja": "Japanese", "ru": "Russian", "ar": "Arabic", "hi": "Hindi"
        }
    },
    "fr": {
        "name": "Français", "title": "AudioLivreur", "by": "par Julien", 
        "drop_text": "Glissez-déposez un fichier ici\n(EPUB, PDF, DOCX, MOBI...)", 
        "ready": "Prêt", "converting": "Conversion en cours...", "success": "Terminé !", "error": "Erreur", 
        "start": "Démarrer la Conversion", "cancel": "Annuler", "close": "Quitter", "settings": "Paramètres", 
        "voice": "Voix :", "rate": "Vitesse :", "volume": "Volume :", "ffmpeg": "Chemin FFmpeg :", 
        "keep_mp3": "Sauvegarder auto. les MP3", "open_folder": "Ouvrir Dossier", "export_merged": "Exporter Fusionné", 
        "export_title": "Enregistrer l'audio fusionné sous", "analyzing": "Analyse...", 
        "file_info": "Chapitres : {} | Mots : {}", "parallel": "Parallèle :", "download_ffmpeg": "⬇️ Télécharger FFmpeg", 
        "loading_voices": "Chargement des voix...", "no_voices": "Aucune voix trouvée",
        "tab_trans": "Traduction", "tab_conv": "Conversion", "target_lang": "Langue cible :", 
        "translate": "Traduire", "init": "Initialisation...",
        "lang_names": {
            "en": "Anglais", "fr": "Français", "es": "Espagnol", "de": "Allemand", "it": "Italien", 
            "pt": "Portugais", "zh": "Chinois", "ja": "Japonais", "ru": "Russe", "ar": "Arabe", "hi": "Hindi"
        }
    },
    "es": {
        "name": "Español", "title": "AudioLivreur", "by": "por Julien", 
        "drop_text": "Arrastrar y soltar archivo aquí\n(EPUB, PDF, DOCX, MOBI...)", 
        "ready": "Listo", "converting": "Convirtiendo...", "success": "¡Hecho!", "error": "Error", 
        "start": "Iniciar Conversión", "cancel": "Cancelar", "close": "Cerrar", "settings": "Ajustes", 
        "voice": "Voz:", "rate": "Velocidad:", "volume": "Volumen:", "ffmpeg": "Ruta FFmpeg:", 
        "keep_mp3": "Auto-guardar MP3s", "open_folder": "Abrir Carpeta", "export_merged": "Exportar Fusionado", 
        "export_title": "Guardar audio fusionado como", "analyzing": "Analizando...", 
        "file_info": "Capítulos: {} | Palabras: {}", "parallel": "Paralelo:", "download_ffmpeg": "⬇️ Descargar FFmpeg", 
        "loading_voices": "Cargando voces...", "no_voices": "No se encontraron voces",
        "tab_trans": "Traducción", "tab_conv": "Conversión", "target_lang": "Idioma de destino:", 
        "translate": "Traducir", "init": "Inicializando...",
        "lang_names": {
            "en": "Inglés", "fr": "Francés", "es": "Español", "de": "Alemán", "it": "Italiano", 
            "pt": "Portugués", "zh": "Chino", "ja": "Japonés", "ru": "Ruso", "ar": "Árabe", "hi": "Hindi"
        }
    },
    "de": {
        "name": "Deutsch", "title": "AudioLivreur", "by": "von Julien", 
        "drop_text": "Datei hier ablegen\n(EPUB, PDF, DOCX, MOBI...)", 
        "ready": "Bereit", "converting": "Konvertierung...", "success": "Fertig!", "error": "Fehler", 
        "start": "Konvertierung starten", "cancel": "Abbrechen", "close": "Schließen", "settings": "Einstellungen", 
        "voice": "Stimme:", "rate": "Geschwindigkeit:", "volume": "Lautstärke:", "ffmpeg": "FFmpeg Pfad:", 
        "keep_mp3": "MP3s automatisch speichern", "open_folder": "Ordner öffnen", "export_merged": "Zusammengeführt exportieren", 
        "export_title": "Zusammengeführtes Audio speichern unter", "analyzing": "Analysieren...", 
        "file_info": "Kapitel: {} | Wörter: {}", "parallel": "Parallel:", "download_ffmpeg": "⬇️ FFmpeg herunterladen", 
        "loading_voices": "Stimmen laden...", "no_voices": "Keine Stimmen gefunden",
        "tab_trans": "Übersetzung", "tab_conv": "Konvertierung", "target_lang": "Zielsprache:", 
        "translate": "Übersetzen", "init": "Initialisierung...",
        "lang_names": {
            "en": "Englisch", "fr": "Französisch", "es": "Spanisch", "de": "Deutsch", "it": "Italienisch", 
            "pt": "Portugiesisch", "zh": "Chinesisch", "ja": "Japanisch", "ru": "Russisch", "ar": "Arabisch", "hi": "Hindi"
        }
    },
    "it": {
        "name": "Italiano", "title": "AudioLivreur", "by": "di Julien", 
        "drop_text": "Trascina file qui\n(EPUB, PDF, DOCX, MOBI...)", 
        "ready": "Pronto", "converting": "Conversione...", "success": "Fatto!", "error": "Errore", 
        "start": "Avvia Conversione", "cancel": "Annulla", "close": "Chiudi", "settings": "Impostazioni", 
        "voice": "Voce:", "rate": "Velocità:", "volume": "Volume:", "ffmpeg": "Percorso FFmpeg:", 
        "keep_mp3": "Salva auto. MP3", "open_folder": "Apri Cartella", "export_merged": "Esporta Unito", 
        "export_title": "Salva audio unito come", "analyzing": "Analisi...", 
        "file_info": "Capitoli: {} | Parole: {}", "parallel": "Parallelo:", "download_ffmpeg": "⬇️ Scarica FFmpeg", 
        "loading_voices": "Caricamento voci...", "no_voices": "Nessuna voce trovata",
        "tab_trans": "Traduzione", "tab_conv": "Conversione", "target_lang": "Lingua di destinazione:", 
        "translate": "Traduci", "init": "Inizializzazione...",
        "lang_names": {
            "en": "Inglese", "fr": "Francese", "es": "Spagnolo", "de": "Tedesco", "it": "Italiano", 
            "pt": "Portoghese", "zh": "Cinese", "ja": "Giapponese", "ru": "Russo", "ar": "Arabo", "hi": "Hindi"
        }
    },
    "pt": {
        "name": "Português", "title": "AudioLivreur", "by": "por Julien", 
        "drop_text": "Arraste e solte o arquivo aqui\n(EPUB, PDF, DOCX, MOBI...)", 
        "ready": "Pronto", "converting": "Convertendo...", "success": "Feito!", "error": "Erro", 
        "start": "Iniciar Conversão", "cancel": "Cancelar", "close": "Fechar", "settings": "Configurações", 
        "voice": "Voz:", "rate": "Velocidade:", "volume": "Volume:", "ffmpeg": "Caminho FFmpeg:", 
        "keep_mp3": "Salvar auto. MP3s", "open_folder": "Abrir Pasta", "export_merged": "Exportar Fundido", 
        "export_title": "Salvar áudio fundido como", "analyzing": "Analisando...", 
        "file_info": "Capítulos: {} | Palavras: {}", "parallel": "Paralelo:", "download_ffmpeg": "⬇️ Baixar FFmpeg", 
        "loading_voices": "Carregando vozes...", "no_voices": "Nenhuma voz encontrada",
        "tab_trans": "Tradução", "tab_conv": "Conversão", "target_lang": "Idioma de destino:", 
        "translate": "Traduzir", "init": "Inicializando...",
        "lang_names": {
            "en": "Inglês", "fr": "Francês", "es": "Espanhol", "de": "Alemão", "it": "Italiano", 
            "pt": "Português", "zh": "Chinês", "ja": "Japonês", "ru": "Russo", "ar": "Árabe", "hi": "Hindi"
        }
    },
    "zh": {
        "name": "中文", "title": "AudioLivreur", "by": "Julien 制作", 
        "drop_text": "将文件拖放到此处\n(EPUB, PDF, DOCX, MOBI...)", 
        "ready": "就绪", "converting": "转换中...", "success": "完成！", "error": "错误", 
        "start": "开始转换", "cancel": "取消", "close": "关闭", "settings": "设置", 
        "voice": "语音:", "rate": "语速:", "volume": "音量:", "ffmpeg": "FFmpeg 路径:", 
        "keep_mp3": "自动保存 MP3", "open_folder": "打开文件夹", "export_merged": "导出合并音频", 
        "export_title": "保存合并音频为", "analyzing": "分析中...", 
        "file_info": "章节: {} | 字数: {}", "parallel": "并行:", "download_ffmpeg": "⬇️ 下载 FFmpeg", 
        "loading_voices": "加载语音中...", "no_voices": "未找到语音",
        "tab_trans": "翻译", "tab_conv": "转换", "target_lang": "目标语言:", 
        "translate": "翻译", "init": "正在初始化...",
        "lang_names": {
            "en": "英语", "fr": "法语", "es": "西班牙语", "de": "德语", "it": "意大利语", 
            "pt": "葡萄牙语", "zh": "中文", "ja": "日语", "ru": "俄语", "ar": "阿拉伯语", "hi": "印地语"
        }
    },
    "ja": {
        "name": "日本語", "title": "AudioLivreur", "by": "Julien 作", 
        "drop_text": "ここにファイルをドロップ\n(EPUB, PDF, DOCX, MOBI...)", 
        "ready": "準備完了", "converting": "変換中...", "success": "完了！", "error": "エラー", 
        "start": "変換開始", "cancel": "キャンセル", "close": "閉じる", "settings": "設定", 
        "voice": "音声:", "rate": "速度:", "volume": "音量:", "ffmpeg": "FFmpeg パス:", 
        "keep_mp3": "MP3を自動保存", "open_folder": "フォルダを開く", "export_merged": "結合してエクスポート", 
        "export_title": "結合オーディオを保存", "analyzing": "分析中...", 
        "file_info": "章: {} | 単語数: {}", "parallel": "並列:", "download_ffmpeg": "⬇️ FFmpegをダウンロード", 
        "loading_voices": "音声を読み込み中...", "no_voices": "音声が見つかりません",
        "tab_trans": "翻訳", "tab_conv": "変換", "target_lang": "ターゲット言語:", 
        "translate": "翻訳", "init": "初期化中...",
        "lang_names": {
            "en": "英語", "fr": "フランス語", "es": "スペイン語", "de": "ドイツ語", "it": "イタリア語", 
            "pt": "ポルトガル語", "zh": "中国語", "ja": "日本語", "ru": "ロシア語", "ar": "アラビア語", "hi": "ヒンディー語"
        }
    },
    "ru": {
        "name": "Русский", "title": "AudioLivreur", "by": "от Julien", 
        "drop_text": "Перетащите файл сюда\n(EPUB, PDF, DOCX, MOBI...)", 
        "ready": "Готово", "converting": "Конвертация...", "success": "Готово!", "error": "Ошибка", 
        "start": "Начать конвертацию", "cancel": "Отмена", "close": "Закрыть", "settings": "Настройки", 
        "voice": "Голос:", "rate": "Скорость:", "volume": "Громкость:", "ffmpeg": "Путь к FFmpeg:", 
        "keep_mp3": "Автосохранение MP3", "open_folder": "Открыть папку", "export_merged": "Экспорт (объед.)", 
        "export_title": "Сохранить объединенное аудио как", "analyzing": "Анализ...", 
        "file_info": "Главы: {} | Слова: {}", "parallel": "Параллельно:", "download_ffmpeg": "⬇️ Скачать FFmpeg", 
        "loading_voices": "Загрузка голосов...", "no_voices": "Голоса не найдены",
        "tab_trans": "Перевод", "tab_conv": "Конвертация", "target_lang": "Целевой язык:", 
        "translate": "Перевести", "init": "Инициализация...",
        "lang_names": {
            "en": "Английский", "fr": "Французский", "es": "Испанский", "de": "Немецкий", "it": "Итальянский", 
            "pt": "Португальский", "zh": "Китайский", "ja": "Японский", "ru": "Русский", "ar": "Арабский", "hi": "Хинди"
        }
    },
    "ar": {
        "name": "العربية", "title": "AudioLivreur", "by": "بواسطة Julien", 
        "drop_text": "أفلت الملف هنا\n(EPUB, PDF, DOCX, MOBI...)", 
        "ready": "جاهز", "converting": "جاري التحويل...", "success": "تم!", "error": "خطأ", 
        "start": "بدء التحويل", "cancel": "إلغاء", "close": "إغلاق", "settings": "الإعدادات", 
        "voice": "الصوت:", "rate": "السرعة:", "volume": "مستوى الصوت:", "ffmpeg": "مسار FFmpeg:", 
        "keep_mp3": "حفظ تلقائي لـ MP3", "open_folder": "فتح المجلد", "export_merged": "تصدير مدمج", 
        "export_title": "حفظ الصوت المدمج باسم", "analyzing": "جاري التحليل...", 
        "file_info": "الفصول: {} | الكلمات: {}", "parallel": "توازي:", "download_ffmpeg": "⬇️ تحميل FFmpeg", 
        "loading_voices": "جاري تحميل الأصوات...", "no_voices": "لم يتم العثور على أصوات",
        "tab_trans": "ترجمة", "tab_conv": "تحويل", "target_lang": "اللغة المستهدفة:", 
        "translate": "ترجم", "init": "تهيئة...",
        "lang_names": {
            "en": "الإنجليزية", "fr": "الفرنسية", "es": "الإسبانية", "de": "الألمانية", "it": "الإيطالية", 
            "pt": "البرتغالية", "zh": "الصينية", "ja": "اليابانية", "ru": "الروسية", "ar": "العربية", "hi": "الهندية"
        }
    },
    "hi": {
        "name": "हिन्दी", "title": "AudioLivreur", "by": "Julien द्वारा", 
        "drop_text": "फ़ाइल यहाँ छोड़ें\n(EPUB, PDF, DOCX, MOBI...)", 
        "ready": "तैयार", "converting": "परिवर्तित हो रहा है...", "success": "हो गया!", "error": "त्रुटि", 
        "start": "रूपांतरण शुरू करें", "cancel": "रद्द करें", "close": "बंद करें", "settings": "सेटिंग्स", 
        "voice": "आवाज़:", "rate": "गति:", "volume": "वॉल्यूम:", "ffmpeg": "FFmpeg पथ:", 
        "keep_mp3": "MP3 ऑटो-सेव करें", "open_folder": "फ़ोल्डर खोलें", "export_merged": "मर्ज किया हुआ निर्यात करें", 
        "export_title": "मर्ज किया हुआ ऑडियो इस रूप में सहेजें", "analyzing": "विश्लेषण कर रहा है...", 
        "file_info": "अध्याय: {} | शब्द: {}", "parallel": "समानांतर:", "download_ffmpeg": "⬇️ FFmpeg डाउनलोड करें", 
        "loading_voices": "आवाज़ें लोड हो रही हैं...", "no_voices": "कोई आवाज़ नहीं मिली",
        "tab_trans": "अनुवाद", "tab_conv": "रूपांतरण", "target_lang": "लक्ष्य भाषा:", 
        "translate": "अनुवाद करें", "init": "प्रारंभ हो रहा है...",
        "lang_names": {
            "en": "अंग्रेज़ी", "fr": "फ्रेंच", "es": "स्पेनिश", "de": "जर्मन", "it": "इतालवी", 
            "pt": "पुर्तगाली", "zh": "चीनी", "ja": "जापानी", "ru": "रूसी", "ar": "अरबी", "hi": "हिन्दी"
        }
    }
}

class AnimatedButton(ctk.CTkButton):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.bind("<Button-1>", self.on_click)
        self.bind("<ButtonRelease-1>", self.on_release)

    def on_click(self, event):
        self.configure(border_width=2, border_color="gray50")

    def on_release(self, event):
        self.configure(border_width=0)

class HistogramProgress(ctk.CTkCanvas):
    def __init__(self, master, **kwargs):
        super().__init__(master, **kwargs)
        self.bars = []
        self.num_bars = 30
        self.bind("<Configure>", self.draw_bars)
        self.progress = 0.0

    def draw_bars(self, event=None):
        self.delete("all")
        w = self.winfo_width()
        h = self.winfo_height()
        bar_w = w / self.num_bars
        self.bars = []
        
        # Calculate how many bars are fully filled
        total_filled = self.progress * self.num_bars
        full_bars_count = int(total_filled)
        partial_fill = total_filled - full_bars_count
        
        for i in range(self.num_bars):
            x0 = i * bar_w + 2
            y0 = h
            x1 = (i + 1) * bar_w - 2
            # Height varies slightly for "audio" look
            bar_h = h * (0.5 + 0.4 * math.sin(i * 0.5)) 
            y1 = h - bar_h
            
            # Draw background bar (gray)
            self.create_rectangle(x0, y1, x1, y0, fill="gray85", outline="")
            
            # Draw filled portion (pink)
            if i < full_bars_count:
                # Fully filled
                self.create_rectangle(x0, y1, x1, y0, fill=PINK_COLOR, outline="")
            elif i == full_bars_count:
                # Partially filled vertically
                fill_h = bar_h * partial_fill
                y_fill = h - fill_h
                self.create_rectangle(x0, y_fill, x1, y0, fill=PINK_COLOR, outline="")

    def set_progress(self, value):
        self.progress = value
        self.draw_bars()

class ScrollingText(ctk.CTkLabel):
    def __init__(self, master, **kwargs):
        super().__init__(master, **kwargs)
        self.current_text = ""

    def set_text(self, text):
        self.current_text = text
        self.configure(text=text)

    def stop(self):
        pass

class ConversionFrame(ctk.CTkFrame, TkinterDnD.DnDWrapper):
    def __init__(self, master, app, **kwargs):
        super().__init__(master, **kwargs)
        self.app = app
        self.TkdndVersion = TkinterDnD._require(self)
        
        self.epub_path = None
        self.converter = None
        self.is_converting = False
        
        # Grid Layout
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(1, weight=1) # Drop zone expands
        
        # Drop Zone
        self.drop_frame = ctk.CTkFrame(self, fg_color=("gray95", "gray90"), corner_radius=15, border_width=2, border_color=("gray80", "gray70"))
        self.drop_frame.grid(row=0, column=0, padx=40, pady=20, sticky="nsew")
        self.drop_frame.grid_columnconfigure(0, weight=1)
        self.drop_frame.grid_rowconfigure(0, weight=1)
        
        self.drop_label = ctk.CTkLabel(self.drop_frame, text=self.app.t["drop_text"], font=ctk.CTkFont(family=FONT_FAMILY, size=18), text_color="gray40")
        self.drop_label.grid(row=0, column=0, padx=20, pady=20)
        
        self.file_info_label = ctk.CTkLabel(self.drop_frame, text="", font=ctk.CTkFont(family=FONT_FAMILY, size=12), text_color="gray50")
        self.file_info_label.grid(row=1, column=0, pady=(10, 0))
        
        self.drop_frame.drop_target_register(DND_FILES)
        self.drop_frame.dnd_bind('<<Drop>>', self.drop_file)
        self.drop_frame.bind("<Button-1>", self.browse_file)
        self.drop_label.bind("<Button-1>", self.browse_file)

        # Progress Area
        self.progress_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.progress_frame.grid(row=1, column=0, padx=40, pady=(0, 20), sticky="ew")
        self.progress_frame.grid_columnconfigure(0, weight=1)
        
        self.status_label = ctk.CTkLabel(self.progress_frame, text=self.app.t["ready"], anchor="w", font=ctk.CTkFont(family=FONT_FAMILY, size=12), text_color="gray50")
        self.status_label.grid(row=0, column=0, sticky="w")
        
        # Histogram
        self.histogram = HistogramProgress(self.progress_frame, height=40, bg=LIGHT_BG, highlightthickness=0)
        self.histogram.grid(row=1, column=0, sticky="ew", pady=(5, 0))
        
        # Scrolling Text
        self.scrolling_text = ScrollingText(self.progress_frame, text="", height=30, text_color="gray40", font=ctk.CTkFont(family=FONT_FAMILY, size=10))
        self.scrolling_text.grid(row=2, column=0, sticky="ew", pady=(5, 0))

        # Action Buttons
        self.action_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.action_frame.grid(row=2, column=0, padx=40, pady=(0, 30), sticky="ew")
        
        self.start_btn = AnimatedButton(self.action_frame, text=self.app.t["start"], height=45, font=ctk.CTkFont(family=FONT_FAMILY, size=16, weight="bold"), fg_color=PINK_COLOR, hover_color="#c20068", text_color="white", command=self.start_conversion, state="disabled")
        
        self.cancel_btn = AnimatedButton(self.action_frame, text=self.app.t["close"], height=45, fg_color="transparent", border_width=2, border_color="gray50", text_color="gray50", command=self.app.close_app)
        self.cancel_btn.pack(side="right", padx=(20, 0))

        self.open_folder_btn = AnimatedButton(self.action_frame, text=self.app.t["open_folder"], height=45, fg_color="gray90", hover_color="gray80", text_color="black", command=self.open_folder)
        self.export_merged_btn = AnimatedButton(self.action_frame, text=self.app.t["export_merged"], height=45, fg_color="gray90", hover_color="gray80", text_color="black", command=self.export_merged)

    def update_texts(self):
        self.drop_label.configure(text=self.app.t["drop_text"])
        self.start_btn.configure(text=self.app.t["start"])
        if self.is_converting:
             self.cancel_btn.configure(text=self.app.t["cancel"])
        else:
             self.cancel_btn.configure(text=self.app.t["close"])
        self.open_folder_btn.configure(text=self.app.t["open_folder"])
        self.export_merged_btn.configure(text=self.app.t["export_merged"])
        if not self.is_converting and not self.epub_path:
            self.status_label.configure(text=self.app.t["ready"])

    def drop_file(self, event):
        path = event.data
        if path.startswith('{') and path.endswith('}'):
            path = path[1:-1]
        self.load_file(path)

    def browse_file(self, event=None):
        file_path = filedialog.askopenfilename(filetypes=[("Ebook Files", "*.epub *.pdf *.docx *.txt *.mobi *.azw3")])
        if file_path:
            self.load_file(file_path)

    def load_file(self, path):
        self.epub_path = path
        self.file_info_label.configure(text=self.app.t["analyzing"])
        self.status_label.configure(text=self.app.t["ready"])
        self.start_btn.pack_forget()
        self.open_folder_btn.pack_forget()
        self.export_merged_btn.pack_forget()
        
        threading.Thread(target=self.analyze_file, daemon=True).start()

    def analyze_file(self):
        try:
            # Temporary converter just for scanning
            temp_converter = Converter(self.epub_path, "", "", 0, 0)
            num_chapters, word_count = temp_converter.scan_file()
            
            def _update():
                self.file_info_label.configure(text=self.app.t["file_info"].format(num_chapters, word_count))
                self.start_btn.pack(side="right", padx=10, fill="x", expand=True)
                self.start_btn.configure(state="normal")
            self.after(0, _update)
            
        except Exception as e:
            print(f"Error analyzing file: {e}")
            self.after(0, lambda: self.file_info_label.configure(text=self.app.t["error"]))

    def start_conversion(self):
        if not self.epub_path: return
        
        self.is_converting = True
        self.start_btn.configure(state="disabled", fg_color="white", text_color=PINK_COLOR, border_width=2, border_color=PINK_COLOR)
        self.cancel_btn.configure(text=self.app.t["cancel"])
        self.status_label.configure(text=self.app.t["converting"])
        self.histogram.set_progress(0)
        
        voice = self.app.voice_var.get()
        rate = self.app.rate_var.get()
        volume = self.app.volume_var.get()
        ffmpeg_path = self.app.ffmpeg_path_var.get()
        keep_mp3s = self.app.keep_mp3s_var.get()
        max_parallel = self.app.parallel_var.get()
        
        self.converter = Converter(
            self.epub_path, ffmpeg_path, voice, rate, volume, keep_mp3s, max_parallel,
            progress_callback=self.update_progress,
            log_callback=self.log_message,
            finished_callback=self.conversion_finished,
            text_callback=self.update_scrolling_text
        )
        
        threading.Thread(target=self.converter.run, daemon=True).start()

    def update_progress(self, current, total, msg):
        progress = current / total if total > 0 else 0
        self.after(0, lambda: [
            self.histogram.set_progress(progress),
            self.status_label.configure(text=f"{msg}")
        ])

    def log_message(self, msg):
        logging.info(msg)

    def update_scrolling_text(self, text):
        self.after(0, lambda: self.scrolling_text.set_text(text))

    def conversion_finished(self, success, msg):
        self.is_converting = False
        def _update():
            self.start_btn.configure(state="normal", fg_color=PINK_COLOR, text_color="white", border_width=0)
            self.start_btn.pack_forget() # Hide start button
            self.cancel_btn.configure(text=self.app.t["close"])
            
            if success:
                self.status_label.configure(text=self.app.t["success"], text_color=PINK_COLOR)
                self.open_folder_btn.pack(side="right", padx=10, fill="x", expand=True)
                self.export_merged_btn.pack(side="right", padx=10, fill="x", expand=True)
                tk.messagebox.showinfo(self.app.t["success"], msg)
            else:
                self.status_label.configure(text=self.app.t["error"], text_color="red")
                self.start_btn.pack(side="right", padx=10, fill="x", expand=True) # Show start again
                tk.messagebox.showerror(self.app.t["error"], msg)
                
        self.after(0, _update)

    def open_folder(self):
        if self.epub_path:
            folder = os.path.dirname(self.epub_path)
            os.startfile(folder)

    def export_merged(self):
        if not self.epub_path: return
        
        base_name = os.path.splitext(os.path.basename(self.epub_path))[0]
        default_name = f"{base_name}.m4b"
        
        file_path = filedialog.asksaveasfilename(
            defaultextension=".m4b",
            filetypes=[("Audiobook", "*.m4b")],
            initialfile=default_name,
            title=self.app.t["export_title"]
        )
        
        if file_path:
            # The file is already created in the source folder, we just copy it
            source_m4b = os.path.join(os.path.dirname(self.epub_path), default_name)
            if os.path.exists(source_m4b):
                try:
                    shutil.copy2(source_m4b, file_path)
                    tk.messagebox.showinfo(self.app.t["success"], f"File saved to {file_path}")
                except Exception as e:
                    tk.messagebox.showerror(self.app.t["error"], f"Failed to save file: {e}")
            else:
                tk.messagebox.showerror(self.app.t["error"], "Source file not found.")

class TranslationFrame(ctk.CTkFrame, TkinterDnD.DnDWrapper):
    def __init__(self, master, app, **kwargs):
        super().__init__(master, **kwargs)
        self.app = app
        self.TkdndVersion = TkinterDnD._require(self)
        
        self.file_path = None
        self.translator = None
        self.is_translating = False
        
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(1, weight=1)
        
        # Drop Zone
        self.drop_frame = ctk.CTkFrame(self, fg_color=("gray95", "gray90"), corner_radius=15, border_width=2, border_color=("gray80", "gray70"))
        self.drop_frame.grid(row=0, column=0, padx=40, pady=20, sticky="nsew")
        self.drop_frame.grid_columnconfigure(0, weight=1)
        self.drop_frame.grid_rowconfigure(0, weight=1)
        
        self.drop_label = ctk.CTkLabel(self.drop_frame, text=self.app.t["drop_text"], font=ctk.CTkFont(family=FONT_FAMILY, size=18), text_color="gray40")
        self.drop_label.grid(row=0, column=0, padx=20, pady=20)
        
        self.file_info_label = ctk.CTkLabel(self.drop_frame, text="", font=ctk.CTkFont(family=FONT_FAMILY, size=12), text_color="gray50")
        self.file_info_label.grid(row=1, column=0, pady=(10, 20))
        
        self.drop_frame.drop_target_register(DND_FILES)
        self.drop_frame.dnd_bind('<<Drop>>', self.drop_file)
        self.drop_frame.bind("<Button-1>", self.browse_file)
        self.drop_label.bind("<Button-1>", self.browse_file)

        # Settings Area (Language)
        self.settings_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.settings_frame.grid(row=1, column=0, padx=40, pady=(0, 20), sticky="ew")
        
        self.lang_label = tk.Label(self.settings_frame, text=self.app.t["target_lang"], bg="white", font=("Arial", 10, "bold"))
        self.lang_label.pack(anchor="w")
        
        self.target_lang_var = tk.StringVar()
        self.lang_combo = ttk.Combobox(self.settings_frame, textvariable=self.target_lang_var, state="readonly")
        self.lang_combo.pack(fill="x", pady=(5, 10))
        self.lang_combo.bind("<<ComboboxSelected>>", self.on_lang_change)
        
        # Map display names to codes
        self.display_to_code = {}
        self.update_language_list()

        # Progress Area
        self.progress_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.progress_frame.grid(row=2, column=0, padx=40, pady=(0, 20), sticky="ew")
        self.progress_frame.grid_columnconfigure(0, weight=1)
        
        self.status_label = ctk.CTkLabel(self.progress_frame, text=self.app.t["ready"], anchor="w", font=ctk.CTkFont(family=FONT_FAMILY, size=12), text_color="gray50")
        self.status_label.grid(row=0, column=0, sticky="w")
        
        self.progress_bar = ctk.CTkProgressBar(self.progress_frame, height=10, progress_color=PINK_COLOR)
        self.progress_bar.grid(row=1, column=0, sticky="ew", pady=(5, 0))
        self.progress_bar.set(0)

        # Action Buttons
        self.action_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.action_frame.grid(row=3, column=0, padx=40, pady=(0, 30), sticky="ew")
        
        self.start_btn = AnimatedButton(self.action_frame, text=self.app.t["translate"], height=45, font=ctk.CTkFont(family=FONT_FAMILY, size=16, weight="bold"), fg_color=PINK_COLOR, hover_color="#c20068", text_color="white", command=self.start_translation, state="disabled")
        
        self.cancel_btn = AnimatedButton(self.action_frame, text=self.app.t["close"], height=45, fg_color="transparent", border_width=2, border_color="gray50", text_color="gray50", command=self.app.close_app)
        self.cancel_btn.pack(side="right", padx=(20, 0))

    def update_texts(self):
        self.drop_label.configure(text=self.app.t["drop_text"])
        self.lang_label.configure(text=self.app.t["target_lang"])
        self.start_btn.configure(text=self.app.t["translate"])
        if not self.is_translating:
             self.cancel_btn.configure(text=self.app.t["close"])
        if not self.is_translating and not self.file_path:
            self.status_label.configure(text=self.app.t["ready"])
            
        # Update language list to reflect new interface language
        self.update_language_list()

    def update_language_list(self):
        current_code = self.display_to_code.get(self.target_lang_var.get(), "fr")
        
        self.display_to_code = {}
        display_values = []
        
        # Sort by code to keep stable order or sort by name? Code is fine.
        codes = sorted(LANGUAGES.keys())
        
        for code in codes:
            # Format: "Local Name - English Name - Interface Name"
            # Example: "Français - French - Francés"
            
            local_name = LANGUAGES[code]["name"]
            english_name = LANGUAGES["en"]["lang_names"].get(code, code)
            interface_name = LANGUAGES[self.app.lang]["lang_names"].get(code, code)
            
            # Avoid redundancy if names are identical
            parts = [local_name]
            if english_name != local_name:
                parts.append(english_name)
            if interface_name != local_name and interface_name != english_name:
                parts.append(interface_name)
                
            display_str = " - ".join(parts)
            self.display_to_code[display_str] = code
            display_values.append(display_str)
            
        self.lang_combo['values'] = display_values
        
        # Restore selection
        for name, c in self.display_to_code.items():
            if c == current_code:
                self.lang_combo.set(name)
                break
        
        if not self.lang_combo.get() and display_values:
             self.lang_combo.current(0)

    def on_lang_change(self, event):
        pass # Just updates the var

    def drop_file(self, event):
        path = event.data
        if path.startswith('{') and path.endswith('}'):
            path = path[1:-1]
        self.load_file(path)

    def browse_file(self, event=None):
        file_path = filedialog.askopenfilename(filetypes=[("EPUB Files", "*.epub")])
        if file_path:
            self.load_file(file_path)

    def load_file(self, path):
        self.file_path = path
        self.file_info_label.configure(text=os.path.basename(path))
        self.start_btn.pack(side="right", padx=10, fill="x", expand=True)
        self.start_btn.configure(state="normal")

    def start_translation(self):
        if not self.file_path: return
        
        self.is_translating = True
        self.start_btn.configure(state="disabled")
        self.status_label.configure(text=self.app.t["init"])
        self.progress_bar.set(0)
        
        # Get code from display string
        target_lang_code = self.display_to_code.get(self.target_lang_var.get(), "fr")
        logging.info(f"Starting translation: {self.file_path} -> {target_lang_code}")
        
        self.translator = Translator(
            self.file_path, 
            target_lang_code,
            progress_callback=self.update_progress,
            log_callback=self.log_message,
            finished_callback=self.finished
        )
        
        threading.Thread(target=self.translator.run, daemon=True).start()

    def update_progress(self, current, total, msg):
        progress = current / total if total > 0 else 0
        self.after(0, lambda: [
            self.progress_bar.set(progress),
            self.status_label.configure(text=msg)
        ])

    def log_message(self, msg):
        logging.info(msg)

    def finished(self, success, msg):
        self.is_translating = False
        def _update():
            self.start_btn.configure(state="normal")
            if success:
                self.status_label.configure(text=self.app.t["success"], text_color=PINK_COLOR)
                tk.messagebox.showinfo(self.app.t["success"], msg)
            else:
                self.status_label.configure(text=self.app.t["error"], text_color="red")
                tk.messagebox.showerror(self.app.t["error"], msg)
        self.after(0, _update)

class SplashScreen(tk.Toplevel):
    def __init__(self, parent):
        super().__init__(parent)
        self.overrideredirect(True)
        
        # Center splash
        w, h = 400, 300
        ws = self.winfo_screenwidth()
        hs = self.winfo_screenheight()
        x = (ws/2) - (w/2)
        y = (hs/2) - (h/2)
        self.geometry('%dx%d+%d+%d' % (w, h, x, y))
        
        self.configure(bg='white')
        
        try:
            # Load splash image
            image_path = SCRIPT_DIR / "splash_logo.png"
            if image_path.exists():
                pil_image = Image.open(image_path)
                # Resize if too big
                pil_image.thumbnail((380, 280))
                self.image = ImageTk.PhotoImage(pil_image)
                tk.Label(self, image=self.image, bg='white').pack(expand=True)
            else:
                tk.Label(self, text="AudioLivreur", font=("Arial", 24, "bold"), bg='white', fg=PINK_COLOR).pack(expand=True)
        except Exception as e:
            logging.error(f"Failed to load splash: {e}")
            tk.Label(self, text="AudioLivreur", font=("Arial", 24, "bold"), bg='white', fg=PINK_COLOR).pack(expand=True)
            
        self.update()

class App(ctk.CTk, TkinterDnD.DnDWrapper):
    def __init__(self):
        super().__init__()
        self.TkdndVersion = TkinterDnD._require(self)
        
        self.lang = "fr" 
        self.t = LANGUAGES[self.lang]
        
        self.title("AudioLivreur")
        self.geometry("800x700") # Increased height for toggle
        self.resizable(False, False)
        self.attributes("-alpha", 0.97)
        self.configure(fg_color=LIGHT_BG)
        
        # Set Icon
        try:
            icon_path = SCRIPT_DIR / "app_icon.png"
            if icon_path.exists():
                # Window Icon
                icon_image = Image.open(icon_path)
                self.iconphoto(True, ImageTk.PhotoImage(icon_image))
                # Taskbar Icon (Windows)
                import ctypes
                myappid = 'audiolivreur.app.1.0' # arbitrary string
                ctypes.windll.shell32.SetCurrentProcessExplicitAppUserModelID(myappid)
        except Exception as e:
            print(f"Error loading icon: {e}")
            
        # Show Splash
        self.withdraw()
        splash = SplashScreen(self)
        self.after(3000, lambda: [splash.destroy(), self.deiconify()])
        
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(0, weight=1)
        
        # Shared Variables
        self.voice_var = tk.StringVar(value="en-US-AriaNeural")
        self.rate_var = tk.IntVar(value=0)
        self.volume_var = tk.IntVar(value=0)
        self.parallel_var = tk.IntVar(value=3)
        self.keep_mp3s_var = tk.BooleanVar(value=False)
        self.ffmpeg_path_var = tk.StringVar(value=get_default_ffmpeg_path())
        
        self.available_voices = []
        self.voices_loaded = False
        threading.Thread(target=self.load_voices_bg, daemon=True).start()
        
        # Load flag images
        try:
            self.fr_flag = ctk.CTkImage(Image.open(SCRIPT_DIR / "french_flag.png"), size=(24, 16))
            self.en_flag = ctk.CTkImage(Image.open(SCRIPT_DIR / "english_flag.png"), size=(24, 16))
        except Exception as e:
            print(f"Error loading flags: {e}")
            self.fr_flag = None
            self.en_flag = None
        
        # Main Container
        self.main_container = ctk.CTkFrame(self, corner_radius=20, fg_color="transparent")
        self.main_container.grid(row=0, column=0, padx=20, pady=20, sticky="nsew")
        self.main_container.grid_columnconfigure(0, weight=1)
        self.main_container.grid_rowconfigure(2, weight=1) # Content area expands

        # 1. Header (Title + Lang + Settings)
        self.header_frame = ctk.CTkFrame(self.main_container, fg_color="transparent")
        self.header_frame.grid(row=0, column=0, padx=20, pady=(10, 5), sticky="ew")
        
        self.title_label = ctk.CTkLabel(self.header_frame, text=self.t["title"], font=ctk.CTkFont(family=FONT_FAMILY, size=24, weight="bold"), text_color=PINK_COLOR)
        self.title_label.pack(side="left")
        
        self.by_label = ctk.CTkLabel(self.header_frame, text=self.t["by"], font=ctk.CTkFont(family=FONT_FAMILY, size=12), text_color="gray60")
        self.by_label.pack(side="left", padx=(5, 0), pady=(8, 0))
        
        # Language Selector
        self.lang_var = ctk.StringVar(value=self.t["name"])
        self.lang_menu = ctk.CTkOptionMenu(
            self.header_frame, 
            variable=self.lang_var,
            values=[lang["name"] for lang in LANGUAGES.values()],
            width=100,
            height=24,
            fg_color="gray90",
            button_color="gray80",
            button_hover_color="gray70",
            text_color="black",
            command=self.change_language
        )
        self.lang_menu.pack(side="right", padx=10)
        
        self.settings_btn = AnimatedButton(self.header_frame, text=self.t["settings"], width=80, height=24, fg_color="gray90", hover_color="gray80", text_color="black", command=self.toggle_settings)
        self.settings_btn.pack(side="right")

        # 2. Toggle Switch (Translation / Conversion)
        self.toggle_frame = ctk.CTkFrame(self.main_container, fg_color="gray90", corner_radius=10, height=40)
        self.toggle_frame.grid(row=1, column=0, padx=60, pady=(10, 20), sticky="ew")
        self.toggle_frame.grid_columnconfigure(0, weight=1)
        self.toggle_frame.grid_columnconfigure(1, weight=1)
        
        self.trans_btn = ctk.CTkButton(self.toggle_frame, text=self.t["tab_trans"], fg_color="transparent", text_color="gray50", hover_color="gray85", corner_radius=8, command=self.show_translation)
        self.trans_btn.grid(row=0, column=0, sticky="nsew", padx=2, pady=2)
        
        self.conv_btn = ctk.CTkButton(self.toggle_frame, text=self.t["tab_conv"], fg_color="white", text_color="black", hover_color="white", corner_radius=8, command=self.show_conversion)
        self.conv_btn.grid(row=0, column=1, sticky="nsew", padx=2, pady=2)

        # 3. Content Area
        self.content_area = ctk.CTkFrame(self.main_container, fg_color="transparent")
        self.content_area.grid(row=2, column=0, sticky="nsew")
        self.content_area.grid_columnconfigure(0, weight=1)
        self.content_area.grid_rowconfigure(0, weight=1)

        # Initialize Frames
        self.conversion_frame = ConversionFrame(self.content_area, self, fg_color="transparent")
        self.translation_frame = TranslationFrame(self.content_area, self, fg_color="transparent")
        
        # Show default
        self.show_conversion()
        
        # Settings Window
        self.settings_window = None

    def show_translation(self):
        self.conversion_frame.pack_forget()
        self.translation_frame.pack(fill="both", expand=True)
        
        # Update Toggle Style
        self.trans_btn.configure(fg_color="white", text_color="black")
        self.conv_btn.configure(fg_color="transparent", text_color="gray50")

    def show_conversion(self):
        self.translation_frame.pack_forget()
        self.conversion_frame.pack(fill="both", expand=True)
        
        # Update Toggle Style
        self.conv_btn.configure(fg_color="white", text_color="black")
        self.trans_btn.configure(fg_color="transparent", text_color="gray50")

    def load_voices_bg(self):
        try:
            import edge_tts
            voices = asyncio.run(edge_tts.list_voices())
            self.available_voices = sorted(voices, key=lambda v: (
                0 if v['ShortName'].startswith('fr') else 
                1 if v['ShortName'].startswith('en') else 2, 
                v['ShortName']
            ))
            
            def _update():
                for v in self.available_voices:
                    if "fr-FR-VivienneMultilingualNeural" in v['ShortName']:
                        self.voice_var.set(v['ShortName'])
                        break
                self.voices_loaded = True
            
            self.after(0, _update)
            
        except Exception as e:
            print(f"Error loading voices: {e}")
            self.voices_loaded = True

    def change_language(self, choice):
        for code, data in LANGUAGES.items():
            if data["name"] == choice:
                self.lang = code
                break
        self.update_texts()

    def update_texts(self):
        self.t = LANGUAGES[self.lang]
        self.title_label.configure(text=self.t["title"])
        self.by_label.configure(text=self.t["by"])
        self.settings_btn.configure(text=self.t["settings"])
        
        self.trans_btn.configure(text=self.t["tab_trans"])
        self.conv_btn.configure(text=self.t["tab_conv"])

        self.conversion_frame.update_texts()
        self.translation_frame.update_texts()
        
        if self.settings_window and self.settings_window.winfo_exists():
            self.settings_window.title(self.t["settings"])

    def close_settings(self):
        logging.info("close_settings() called")
        if self.settings_window:
            logging.info("Destroying settings window")
            try:
                self.settings_window.withdraw()
                self.settings_window.destroy()
            except Exception as e:
                logging.error(f"Error destroying settings window: {e}")
            finally:
                self.settings_window = None

    def create_stepper(self, parent, label_text, variable, min_val, max_val, step=10, format_str="{:+d}%"):
        try:
            frame = tk.Frame(parent, bg="white")
            frame.pack(fill="x", pady=(5, 10))
            
            tk.Label(frame, text=label_text, bg="white", fg="black", width=15, anchor="w").pack(side="left")
            
            value_label = tk.Label(frame, text=format_str.format(variable.get()), bg="white", fg="black", width=5)
            
            def change_value(delta):
                new_val = variable.get() + delta
                if min_val <= new_val <= max_val:
                    variable.set(new_val)
                    value_label.configure(text=format_str.format(new_val))
            
            btn_minus = tk.Button(frame, text="-", width=3, bg=PINK_COLOR, fg="white", command=lambda: change_value(-step))
            btn_minus.pack(side="left", padx=(10, 5))
            
            value_label.pack(side="left", padx=5)
            
            btn_plus = tk.Button(frame, text="+", width=3, bg=PINK_COLOR, fg="white", command=lambda: change_value(step))
            btn_plus.pack(side="left", padx=(5, 0))
        except Exception as e:
            logging.error(f"Error creating stepper for {label_text}: {e}")

    def toggle_settings(self):
        try:
            if self.settings_window is not None and self.settings_window.winfo_exists():
                self.settings_window.focus()
                return

            self.settings_window = tk.Toplevel(self)
            self.settings_window.title(self.t["settings"])
            self.settings_window.geometry("500x600")
            self.settings_window.configure(bg="white")
            self.settings_window.protocol("WM_DELETE_WINDOW", self.close_settings)
            
            layout = tk.Frame(self.settings_window, bg="white")
            layout.pack(fill="both", expand=True, padx=20, pady=20)
            
            # Voice Selection
            tk.Label(layout, text=self.t["voice"], bg="white", fg=TEXT_COLOR, font=("Arial", 10, "bold")).pack(anchor="w", pady=(0, 5))
            
            if not self.voices_loaded:
                voice_values = [self.t["loading_voices"]]
            elif self.available_voices:
                voice_values = [v['ShortName'] for v in self.available_voices]
            else:
                voice_values = [self.t["no_voices"]]
                
            voice_combo = ttk.Combobox(layout, values=voice_values, textvariable=self.voice_var, width=50)
            voice_combo.pack(fill="x", pady=(0, 20))
            
            # Rate Stepper
            self.create_stepper(layout, self.t["rate"], self.rate_var, -50, 50, 10, format_str="{:+d}%")
            
            # Volume Stepper
            self.create_stepper(layout, self.t["volume"], self.volume_var, -50, 50, 10, format_str="{:+d}%")
            
            # Parallel Stepper
            self.create_stepper(layout, self.t["parallel"], self.parallel_var, 1, 10, 1, format_str="{:d}")
            
            # FFmpeg Path
            tk.Label(layout, text=self.t["ffmpeg"], bg="white", fg=TEXT_COLOR, font=("Arial", 10, "bold")).pack(anchor="w", pady=(10, 5))
            ffmpeg_frame = tk.Frame(layout, bg="white")
            ffmpeg_frame.pack(fill="x", pady=(0, 5))
            
            tk.Entry(ffmpeg_frame, textvariable=self.ffmpeg_path_var).pack(side="left", fill="x", expand=True)
            tk.Button(ffmpeg_frame, text="📂", width=3, bg=PINK_COLOR, fg="white", command=self.browse_ffmpeg).pack(side="right", padx=(10, 0))
            
            # FFmpeg Download Link
            ffmpeg_link = tk.Label(layout, text=self.t["download_ffmpeg"], bg="white", fg=PINK_COLOR, cursor="hand2", font=("Arial", 10, "underline"))
            ffmpeg_link.pack(anchor="w", pady=(0, 20))
            ffmpeg_link.bind("<Button-1>", lambda e: self.open_ffmpeg_download())
            
            # Keep MP3 Checkbox
            tk.Checkbutton(layout, text=self.t["keep_mp3"], variable=self.keep_mp3s_var, bg="white", fg=TEXT_COLOR, selectcolor="white").pack(anchor="w", pady=(0, 20))
            
            # Close Button
            tk.Button(layout, text=self.t["close"], bg=PINK_COLOR, fg="white", height=2, command=self.close_settings).pack(side="bottom", fill="x", pady=10)

        except Exception as e:
            logging.error(f"Error opening settings: {e}")
            if self.settings_window:
                self.settings_window.destroy()
                self.settings_window = None

    def browse_ffmpeg(self):
        path = filedialog.askopenfilename(filetypes=[("Executable", "*.exe")])
        if path:
            self.ffmpeg_path_var.set(path)

    def open_ffmpeg_download(self):
        import webbrowser
        webbrowser.open("https://www.ffmpeg.org/download.html#build-windows")

    def close_app(self):
        self.on_closing()

    def on_closing(self):
        logging.info("on_closing called")
        try:
            if self.conversion_frame.converter:
                self.conversion_frame.converter.cancel_requested = True
            if self.translation_frame.translator:
                self.translation_frame.translator.cancel_requested = True
                
            self.withdraw()
            self.quit()
        except Exception as e:
            logging.error(f"Error during closing: {e}")
        finally:
            logging.info("Forcing exit")
            os._exit(0)

            




# Setup logging
def setup_logging():
    log_file = "AudioLivreur.log"
    logging.basicConfig(
        level=logging.DEBUG,
        format="%(asctime)s [%(levelname)s] %(message)s",
        handlers=[
            RotatingFileHandler(log_file, maxBytes=5*1024*1024, backupCount=5, encoding='utf-8'),
            logging.StreamHandler(sys.stdout)
        ]
    )
    logging.info("AudioLivreur started")

if __name__ == "__main__":
    setup_logging()
    app = App()
    app.protocol("WM_DELETE_WINDOW", app.on_closing)
    app.mainloop()
