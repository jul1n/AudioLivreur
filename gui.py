import os
import subprocess
import threading
import tempfile
import asyncio
import sys
import logging
from logging.handlers import RotatingFileHandler
import tkinter as tk
import tkinter.messagebox
from tkinter import filedialog, ttk
import webbrowser
import customtkinter as ctk
from tkinterdnd2 import DND_FILES, TkinterDnD
from PIL import Image, ImageTk
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
    # Detect version by file size (> 100MB is Full, else Light)
    try:
        exe_size = os.path.getsize(sys.executable)
        IS_FULL_VERSION = exe_size > 100 * 1024 * 1024 # 100 MB threshold
    except:
        IS_FULL_VERSION = (SCRIPT_DIR / "ffmpeg.exe").exists()
else:
    # Running as script
    SCRIPT_DIR = Path(__file__).parent
    IS_FULL_VERSION = (SCRIPT_DIR / "bin" / "ffmpeg.exe").exists()

# Helper function to detect FFmpeg installation
def get_default_ffmpeg_path():
    """Detect FFmpeg installation on the system."""
    # 1. Try bundled locations first (for standalone app)
    # Check root (for frozen EXE)
    root_ffmpeg = SCRIPT_DIR / "ffmpeg.exe"
    if root_ffmpeg.exists():
        return str(root_ffmpeg)
        
    # Check bin/ folder
    bundled_ffmpeg = SCRIPT_DIR / "bin" / "ffmpeg.exe"
    if bundled_ffmpeg.exists():
        return str(bundled_ffmpeg)

    # 2. Try system PATH
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
    # macOS / Linux
    else:
        common_paths = [
            "/usr/local/bin/ffmpeg",
            "/opt/homebrew/bin/ffmpeg",
            "/usr/bin/ffmpeg",
            Path.home() / "bin" / "ffmpeg"
        ]
        for path in common_paths:
            if Path(path).exists():
                return str(path)
    
    # Return empty string if not found
    return ""

def open_file_explorer(path):
    """Open file explorer at the given path."""
    try:
        if os.name == 'nt':
            os.startfile(path)
        elif sys.platform == 'darwin':
            subprocess.call(['open', path])
        else:
            # Linux/Unix
            subprocess.call(['xdg-open', path])
    except Exception as e:
        logging.error(f"Failed to open explorer: {e}")

# Theme Configuration
PINK_COLOR = "#e2007a"
LIGHT_BG = "#ffffff"
TEXT_COLOR = "#000000"
FONT_FAMILY = "Segoe UI"

ctk.set_appearance_mode("Light")
ctk.set_default_color_theme("blue") 

# Full list of supported languages (from edge-tts)
GLOBAL_LANG_NAMES = {
    "af": "Afrikaans", "am": "Amharic", "ar": "Arabic", "az": "Azerbaijani", "bg": "Bulgarian", 
    "bn": "Bengali", "bs": "Bosnian", "ca": "Catalan", "cs": "Czech", "cy": "Welsh", 
    "da": "Danish", "de": "German", "el": "Greek", "en": "English", "es": "Spanish", 
    "et": "Estonian", "fa": "Persian", "fi": "Finnish", "fil": "Filipino", "fr": "French", 
    "ga": "Irish", "gl": "Galician", "gu": "Gujarati", "he": "Hebrew", "hi": "Hindi", 
    "hr": "Croatian", "hu": "Hungarian", "id": "Indonesian", "is": "Icelandic", "it": "Italian", 
    "iu": "Inuktitut", "ja": "Japanese", "jv": "Javanese", "ka": "Georgian", "kk": "Kazakh", 
    "km": "Khmer", "kn": "Kannada", "ko": "Korean", "lo": "Lao", "lt": "Lithuanian", 
    "lv": "Latvian", "mk": "Macedonian", "ml": "Malayalam", "mn": "Mongolian", "mr": "Marathi", 
    "ms": "Malay", "mt": "Maltese", "my": "Burmese", "nb": "Norwegian", "ne": "Nepali", 
    "nl": "Dutch", "pl": "Polish", "ps": "Pashto", "pt": "Portuguese", "ro": "Romanian", 
    "ru": "Russian", "si": "Sinhala", "sk": "Slovak", "sl": "Slovenian", "so": "Somali", 
    "sq": "Albanian", "sr": "Serbian", "su": "Sundanese", "sv": "Swedish", "sw": "Swahili", 
    "ta": "Tamil", "te": "Telugu", "th": "Thai", "tr": "Turkish", "uk": "Ukrainian", 
    "ur": "Urdu", "uz": "Uzbek", "vi": "Vietnamese", "zh": "Chinese", "zu": "Zulu"
}

# Best default voices mapping
DEFAULT_VOICES = {
    "af": {"Female": "af-ZA-AdriNeural", "Male": "af-ZA-WillemNeural"},
    "am": {"Female": "am-ET-MekdesNeural", "Male": "am-ET-AmehaNeural"},
    "ar": {"Female": "ar-SA-ZariyahNeural", "Male": "ar-SA-HamedNeural"},
    "az": {"Female": "az-AZ-BanuNeural", "Male": "az-AZ-BabekNeural"},
    "bg": {"Female": "bg-BG-KalinaNeural", "Male": "bg-BG-BorislavNeural"},
    "bn": {"Female": "bn-IN-TanishaNeural", "Male": "bn-IN-BashkarNeural"},
    "bs": {"Female": "bs-BA-VesnaNeural", "Male": "bs-BA-GoranNeural"},
    "ca": {"Female": "ca-ES-JoanaNeural", "Male": "ca-ES-EnricNeural"},
    "cs": {"Female": "cs-CZ-VlastaNeural", "Male": "cs-CZ-AntoninNeural"},
    "cy": {"Female": "cy-GB-NiaNeural", "Male": "cy-GB-AledNeural"},
    "da": {"Female": "da-DK-ChristelNeural", "Male": "da-DK-JeppeNeural"},
    "de": {"Female": "de-DE-KatjaNeural", "Male": "de-DE-ConradNeural"},
    "el": {"Female": "el-GR-AthinaNeural", "Male": "el-GR-NestorasNeural"},
    "en": {"Female": "en-US-AvaNeural", "Male": "en-US-AndrewNeural"},
    "es": {"Female": "es-ES-ElviraNeural", "Male": "es-ES-AlvaroNeural"},
    "et": {"Female": "et-EE-AnuNeural", "Male": "et-EE-KertNeural"},
    "fa": {"Female": "fa-IR-DilaraNeural", "Male": "fa-IR-FaridNeural"},
    "fi": {"Female": "fi-FI-NooraNeural", "Male": "fi-FI-HarriNeural"},
    "fil": {"Female": "fil-PH-BlessicaNeural", "Male": "fil-PH-AngeloNeural"},
    "fr": {"Female": "fr-FR-VivienneMultilingualNeural", "Male": "fr-FR-RemyMultilingualNeural"},
    "ga": {"Female": "ga-IE-OrlaNeural", "Male": "ga-IE-ColmNeural"},
    "gl": {"Female": "gl-ES-SabelaNeural", "Male": "gl-ES-RoiNeural"},
    "gu": {"Female": "gu-IN-DhwaniNeural", "Male": "gu-IN-NiranjanNeural"},
    "he": {"Female": "he-IL-HilaNeural", "Male": "he-IL-AvriNeural"},
    "hi": {"Female": "hi-IN-SwaraNeural", "Male": "hi-IN-MadhurNeural"},
    "hr": {"Female": "hr-HR-GabrijelaNeural", "Male": "hr-HR-SreckoNeural"},
    "hu": {"Female": "hu-HU-NoemiNeural", "Male": "hu-HU-TamasNeural"},
    "id": {"Female": "id-ID-GadisNeural", "Male": "id-ID-ArdiNeural"},
    "is": {"Female": "is-IS-GudrunNeural", "Male": "is-IS-GunnarNeural"},
    "it": {"Female": "it-IT-ElsaNeural", "Male": "it-IT-DiegoNeural"},
    "iu": {"Female": "iu-Cans-CA-SiqiniqNeural", "Male": "iu-Cans-CA-TaqqiqNeural"},
    "ja": {"Female": "ja-JP-NanamiNeural", "Male": "ja-JP-KeitaNeural"},
    "jv": {"Female": "jv-ID-SitiNeural", "Male": "jv-ID-DimasNeural"},
    "ka": {"Female": "ka-GE-EkaNeural", "Male": "ka-GE-GiorgiNeural"},
    "kk": {"Female": "kk-KZ-AigulNeural", "Male": "kk-KZ-DauletNeural"},
    "km": {"Female": "km-KH-SreymomNeural", "Male": "km-KH-PisethNeural"},
    "kn": {"Female": "kn-IN-SapnaNeural", "Male": "kn-IN-GaganNeural"},
    "ko": {"Female": "ko-KR-SunHiNeural", "Male": "ko-KR-InJoonNeural"},
    "lo": {"Female": "lo-LA-KeomanyNeural", "Male": "lo-LA-ChanthavongNeural"},
    "lt": {"Female": "lt-LT-OnaNeural", "Male": "lt-LT-LeonasNeural"},
    "lv": {"Female": "lv-LV-EvitaNeural", "Male": "lv-LV-NilsNeural"},
    "mk": {"Female": "mk-MK-MarijaNeural", "Male": "mk-MK-AleksandarNeural"},
    "ml": {"Female": "ml-IN-SobhanaNeural", "Male": "ml-IN-MidhunNeural"},
    "mn": {"Female": "mn-MN-YesuiNeural", "Male": "mn-MN-BataarNeural"},
    "mr": {"Female": "mr-IN-AarohiNeural", "Male": "mr-IN-ManoharNeural"},
    "ms": {"Female": "ms-MY-YasminNeural", "Male": "ms-MY-OsmanNeural"},
    "mt": {"Female": "mt-MT-GraceNeural", "Male": "mt-MT-JosephNeural"},
    "my": {"Female": "my-MM-NilarNeural", "Male": "my-MM-ThihaNeural"},
    "nb": {"Female": "nb-NO-PernilleNeural", "Male": "nb-NO-FinnNeural"},
    "ne": {"Female": "ne-NP-HemkalaNeural", "Male": "ne-NP-SagarNeural"},
    "nl": {"Female": "nl-NL-FennaNeural", "Male": "nl-NL-MaartenNeural"},
    "pl": {"Female": "pl-PL-ZofiaNeural", "Male": "pl-PL-MarekNeural"},
    "ps": {"Female": "ps-AF-LatifaNeural", "Male": "ps-AF-GulKhanNeural"},
    "pt": {"Female": "pt-BR-FranciscaNeural", "Male": "pt-BR-AntonioNeural"},
    "ro": {"Female": "ro-RO-AlinaNeural", "Male": "ro-RO-EmilNeural"},
    "ru": {"Female": "ru-RU-SvetlanaNeural", "Male": "ru-RU-DmitryNeural"},
    "si": {"Female": "si-LK-ThiliniNeural", "Male": "si-LK-SameeraNeural"},
    "sk": {"Female": "sk-SK-ViktoriaNeural", "Male": "sk-SK-LukasNeural"},
    "sl": {"Female": "sl-SI-PetraNeural", "Male": "sl-SI-RadoNeural"},
    "so": {"Female": "so-SO-UbaxNeural", "Male": "so-SO-MuuseNeural"},
    "sq": {"Female": "sq-AL-AnilaNeural", "Male": "sq-AL-IlirNeural"},
    "sr": {"Female": "sr-RS-SophieNeural", "Male": "sr-RS-NicholasNeural"},
    "su": {"Female": "su-ID-TutiNeural", "Male": "su-ID-JajangNeural"},
    "sv": {"Female": "sv-SE-SofieNeural", "Male": "sv-SE-MattiasNeural"},
    "sw": {"Female": "sw-KE-ZuriNeural", "Male": "sw-KE-RafikiNeural"},
    "ta": {"Female": "ta-IN-PallaviNeural", "Male": "ta-IN-ValluvarNeural"},
    "te": {"Female": "te-IN-ShrutiNeural", "Male": "te-IN-MohanNeural"},
    "th": {"Female": "th-TH-PremwadeeNeural", "Male": "th-TH-NiwatNeural"},
    "tr": {"Female": "tr-TR-EmelNeural", "Male": "tr-TR-AhmetNeural"},
    "uk": {"Female": "uk-UA-PolinaNeural", "Male": "uk-UA-OstapNeural"},
    "ur": {"Female": "ur-IN-GulNeural", "Male": "ur-IN-SalmanNeural"},
    "uz": {"Female": "uz-UZ-MadinaNeural", "Male": "uz-UZ-SardorNeural"},
    "vi": {"Female": "vi-VN-HoaiMyNeural", "Male": "vi-VN-NamMinhNeural"},
    "zh": {"Female": "zh-CN-XiaoxiaoNeural", "Male": "zh-CN-YunxiNeural"},
    "zu": {"Female": "zu-ZA-ThandoNeural", "Male": "zu-ZA-ThembaNeural"}
}

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
        "visit_github": "🌐 Visit GitHub Project", "github_url": "https://github.com/jul1n/AudioLivreur",
        "tab_trans": "Translation", "tab_conv": "Audiobook Creation", "target_lang": "Target Language:", 
        "translate": "Translate", "init": "Initializing...",
        "gender": "Voice:", "female": "Woman", "male": "Man", "preview": "▶️ Preview", "pause": "Pause", "resume": "Resume",
        "keep_global_mp3": "Export one global MP3 file", "embed_text": "Embed text (lyrics) in audio",
        "lang_names": {
            "en": "English", "fr": "French", "es": "Spanish", "de": "German", "it": "Italian", 
            "pt": "Portuguese", "zh": "Chinese", "ja": "Japanese", "ru": "Russian", "ar": "Arabic", "hi": "Hindi"
        }
    },
    "fr": {
        "name": "Français", "title": "AudioLivreur", "by": "par Julien", 
        "drop_text": "Glissez-déposez un fichier ici\n(EPUB, PDF, DOCX, MOBI...)", 
        "ready": "Prêt", "converting": "Création en cours...", "success": "Terminé !", "error": "Erreur", 
        "start": "Créer le Livre Audio", "cancel": "Annuler", "close": "Quitter", "settings": "Paramètres", 
        "voice": "Voix :", "rate": "Vitesse :", "volume": "Volume :", "ffmpeg": "Chemin FFmpeg :", 
        "keep_mp3": "Sauvegarder auto. les MP3", "open_folder": "Ouvrir Dossier", "export_merged": "Exporter Fusionné", 
        "export_title": "Enregistrer l'audio fusionné sous", "analyzing": "Analyse...", 
        "file_info": "Chapitres : {} | Mots : {}", "parallel": "Parallèle :", "download_ffmpeg": "⬇️ Télécharger FFmpeg", 
        "loading_voices": "Chargement des voix...", "no_voices": "Aucune voix trouvée",
        "visit_github": "🌐 Voir le projet sur GitHub", "github_url": "https://github.com/jul1n/AudioLivreur",
        "tab_trans": "Traduction", "tab_conv": "Création Audio", "target_lang": "Langue cible :", 
        "translate": "Traduire", "init": "Initialisation...",
        "gender": "Voix :", "female": "Femme", "male": "Homme", "preview": "▶️ Aperçu", "pause": "Pause", "resume": "Reprendre",
        "keep_global_mp3": "Exporter un seul MP3 global", "embed_text": "Intégrer le texte (paroles) dans l'audio",
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
        "visit_github": "🌐 Ver el proyecto en GitHub", "github_url": "https://github.com/jul1n/AudioLivreur",
        "tab_trans": "Traducción", "tab_conv": "Creación Audio", "target_lang": "Idioma de destino:", 
        "translate": "Traducir", "init": "Inicializando...",
        "gender": "Voz:", "female": "Mujer", "male": "Hombre", "preview": "▶️ Vista previa", "pause": "Pausa", "resume": "Reanudar",
        "keep_global_mp3": "Exportar un solo archivo MP3 global", "embed_text": "Incrustar texto (letra) en el audio",
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
        "visit_github": "🌐 Projekt auf GitHub ansehen", "github_url": "https://github.com/jul1n/AudioLivreur",
        "tab_trans": "Übersetzung", "tab_conv": "Konvertierung", "target_lang": "Zielsprache:", 
        "translate": "Übersetzen", "init": "Initialisierung...",
        "gender": "Stimme:", "female": "Frau", "male": "Mann", "preview": "▶️ Vorschau", "pause": "Pause", "resume": "Fortsetzen",
        "keep_global_mp3": "Eine globale MP3-Datei exportieren", "embed_text": "Text (Lyrics) in Audio einbetten",
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
        "visit_github": "🌐 Vedi il progetto su GitHub", "github_url": "https://github.com/jul1n/AudioLivreur",
        "tab_trans": "Traduzione", "tab_conv": "Conversione", "target_lang": "Lingua di destinazione:", 
        "translate": "Traduci", "init": "Inizializzazione...",
        "gender": "Voce:", "female": "Donna", "male": "Uomo", "preview": "▶️ Anteprima", "pause": "Pausa", "resume": "Riprendi",
        "keep_global_mp3": "Esporta un unico file MP3 globale", "embed_text": "Incorpora testo (testi) nell'audio",
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
        "file_info": "Capítulos: {} | Palabras: {}", "parallel": "Paralelo:", "download_ffmpeg": "⬇️ Baixar FFmpeg", 
        "loading_voices": "Carregando vozes...", "no_voices": "Nenhuma voz encontrada",
        "visit_github": "🌐 Ver o projeto no GitHub", "github_url": "https://github.com/jul1n/AudioLivreur",
        "tab_trans": "Tradução", "tab_conv": "Conversão", "target_lang": "Idioma de destino:", 
        "translate": "Traduzir", "init": "Inicializando...",
        "gender": "Voz:", "female": "Mulher", "male": "Homem", "preview": "▶️ Pré-visualização", "pause": "Pausa", "resume": "Retomar",
        "keep_global_mp3": "Exportar um arquivo MP3 global único", "embed_text": "Incorporar texto (letras) no áudio",
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
        "visit_github": "🌐 在 GitHub 上查看项目", "github_url": "https://github.com/jul1n/AudioLivreur",
        "tab_trans": "翻译", "tab_conv": "音频制作", "target_lang": "目标语言:", 
        "translate": "翻译", "init": "正在初始化...",
        "gender": "声音:", "female": "女性", "male": "男性", "preview": "▶️ 预览", "pause": "暂停", "resume": "恢复",
        "keep_global_mp3": "导出一个全局 MP3 文件", "embed_text": "在音频中嵌入文本（歌词）",
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
        "visit_github": "🌐 GitHubでプロジェクトを表示", "github_url": "https://github.com/jul1n/AudioLivreur",
        "tab_trans": "翻訳", "tab_conv": "変換", "target_lang": "ターゲット言語:", 
        "translate": "翻訳", "init": "初期化中...",
        "gender": "音声:", "female": "女性", "male": "男性", "preview": "▶️ プレビュー", "pause": "一時停止", "resume": "再開",
        "keep_global_mp3": "1つのグローバルMP3ファイルをエクスポート", "embed_text": "オーディオにテキスト（歌詞）を埋め込む",
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
        "visit_github": "🌐 Посмотреть проект на GitHub", "github_url": "https://github.com/jul1n/AudioLivreur",
        "tab_trans": "Перевод", "tab_conv": "Конвертация", "target_lang": "Целевой язык:", 
        "translate": "Перевести", "init": "Инициализация...",
        "gender": "Голос:", "female": "Женщина", "male": "Мужчина", "preview": "▶️ Предпросмотр", "pause": "Пауза", "resume": "Продолжить",
        "keep_global_mp3": "Экспортировать один общий MP3 файл", "embed_text": "Встроить текст (тексты песен) в аудио",
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
        "visit_github": "🌐 عرض المشروع على GitHub", "github_url": "https://github.com/jul1n/AudioLivreur",
        "tab_trans": "ترجمة", "tab_conv": "تحويل", "target_lang": "اللغة المستهدفة:", 
        "translate": "ترجم", "init": "تهيئة...",
        "gender": "الصوت:", "female": "أنثى", "male": "ذكر", "preview": "▶️ معاينة", "pause": "إيقاف مؤقت", "resume": "استئناف",
        "keep_global_mp3": "تصدير ملف MP3 عالمي واحد", "embed_text": "تضمين النص (كلمات الأغاني) in الصوت",
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
        "visit_github": "🌐 GitHub पर प्रोजेक्ट देखें", "github_url": "https://github.com/jul1n/AudioLivreur",
        "tab_trans": "अनुवाद", "tab_conv": "रूपांतरण", "target_lang": "लक्ष्य भाषा:", 
        "translate": "अनुवाद करें", "init": "प्रारंभ हो रहा है...",
        "gender": "आवाज़:", "female": "महिला", "male": "पुरुष", "preview": "▶️ पूर्वावलोकन", "pause": "विराम", "resume": "फिर से शुरू करें",
        "keep_global_mp3": "एक वैश्विक MP3 फ़ाइल निर्यात करें", "embed_text": "ऑडियो में टेक्स्ट (बोल) एम्बेड करें",
        "lang_names": {
            "en": "अंग्रेज़ी", "fr": "फ्रेंच", "es": "स्पेनish", "de": "जर्मन", "it": "इतालवी", 
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

class FileListItem(ctk.CTkFrame):
    def __init__(self, master, file_path, on_remove, **kwargs):
        super().__init__(master, fg_color="white", corner_radius=10, height=40, **kwargs)
        self.file_path = file_path
        
        file_name = os.path.basename(file_path)
        # Truncate if too long
        if len(file_name) > 40:
            file_name = file_name[:37] + "..."
            
        self.label = ctk.CTkLabel(self, text=file_name, font=ctk.CTkFont(family=FONT_FAMILY, size=12), text_color="black")
        self.label.pack(side="left", padx=15, pady=5)
        
        self.remove_btn = ctk.CTkButton(self, text="✕", width=24, height=24, corner_radius=12, fg_color="transparent", text_color="gray60", hover_color="#feeef5", command=lambda: on_remove(self))
        self.remove_btn.pack(side="right", padx=10)

class ConversionFrame(ctk.CTkFrame, TkinterDnD.DnDWrapper):
    def __init__(self, master, app, **kwargs):
        super().__init__(master, **kwargs)
        self.app = app
        self.TkdndVersion = TkinterDnD._require(self)
        
        self.file_queue = [] # List of (path, item_widget)
        self.current_index = -1
        self.is_converting = False
        self.converter = None
        self.selected_cover_path = None
        self.current_temp_dir = None
        
        # Grid Layout
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(1, weight=1) # Drop zone expands
        
        # Drop Zone
        self.drop_frame = ctk.CTkFrame(self, fg_color=("gray95", "gray90"), corner_radius=15, border_width=2, border_color=("gray80", "gray70"))
        self.drop_frame.grid(row=0, column=0, padx=40, pady=10, sticky="nsew")
        self.drop_frame.grid_columnconfigure(0, weight=1)
        self.drop_frame.grid_rowconfigure(0, weight=1)
        
        self.drop_label = ctk.CTkLabel(self.drop_frame, text=self.app.t["drop_text"], font=ctk.CTkFont(family=FONT_FAMILY, size=18), text_color="gray40")
        self.drop_label.grid(row=0, column=0, padx=20, pady=20)
        
        self.drop_frame.drop_target_register(DND_FILES)
        self.drop_frame.dnd_bind('<<Drop>>', self.drop_file)
        self.drop_frame.bind("<Button-1>", self.browse_file)
        self.drop_label.bind("<Button-1>", self.browse_file)

        # File List Area (Scrollable)
        self.scroll_frame = ctk.CTkScrollableFrame(self, fg_color="transparent", height=130)
        self.scroll_frame.grid(row=1, column=0, padx=40, pady=(0, 5), sticky="nsew")
        self.scroll_frame.grid_remove() # Hidden if empty

        # Progress Area
        self.progress_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.progress_frame.grid(row=2, column=0, padx=40, pady=(0, 10), sticky="ew")
        self.progress_frame.grid_columnconfigure(0, weight=1)
        
        # Status and LED container
        self.status_container = ctk.CTkFrame(self.progress_frame, fg_color="transparent")
        self.status_container.grid(row=0, column=0, sticky="w")
        
        self.status_led_canvas = tk.Canvas(self.status_container, width=15, height=15, bg=LIGHT_BG, highlightthickness=0)
        self.status_led_canvas.pack(side="left", padx=(0, 5))
        self.status_led = self.status_led_canvas.create_oval(2, 2, 13, 13, fill="gray", outline="gray")
        
        self.status_label = ctk.CTkLabel(self.status_container, text=self.app.t["ready"], anchor="w", font=ctk.CTkFont(family=FONT_FAMILY, size=12), text_color=PINK_COLOR, cursor="hand2")
        self.status_label.pack(side="left")
        self.status_label.bind("<Button-1>", lambda e: webbrowser.open(self.app.t["github_url"]))
        
        # Histogram
        self.histogram = HistogramProgress(self.progress_frame, height=40, bg=LIGHT_BG, highlightthickness=0)
        self.histogram.grid(row=1, column=0, sticky="ew", pady=(5, 0))
        
        # Scrolling Text
        self.scrolling_text = ScrollingText(self.progress_frame, text="", height=30, text_color="gray40", font=ctk.CTkFont(family=FONT_FAMILY, size=10))
        self.scrolling_text.grid(row=2, column=0, sticky="ew", pady=(5, 0))

        # Gender Selection
        self.gender_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.gender_frame.grid(row=3, column=0, padx=40, pady=(5, 10), sticky="ew")
        
        self.gender_label = ctk.CTkLabel(self.gender_frame, text=self.app.t["gender"], font=ctk.CTkFont(family=FONT_FAMILY, size=12, weight="bold"))
        self.gender_label.pack(side="left", padx=(0, 10))
        
        # Voice Language selection
        self.voice_lang_var = ctk.StringVar(value=self.app.lang)
        self.display_to_lang = {v: k for k, v in GLOBAL_LANG_NAMES.items()}
        self.lang_options = sorted(GLOBAL_LANG_NAMES.values())
        
        self.voice_lang_menu = ctk.CTkOptionMenu(
            self.gender_frame, 
            values=self.lang_options,
            command=self.on_voice_lang_change,
            width=140,
            height=28,
            fg_color="white",
            button_color=PINK_COLOR,
            button_hover_color="#c20068",
            text_color="black",
            font=ctk.CTkFont(family=FONT_FAMILY, size=11)
        )
        current_lang_name = GLOBAL_LANG_NAMES.get(self.app.lang, "French")
        self.voice_lang_menu.set(current_lang_name)
        self.voice_lang_menu.pack(side="left", padx=(0, 10))
        
        self.gender_var = ctk.StringVar(value="female")
        self.female_radio = ctk.CTkRadioButton(self.gender_frame, text=self.app.t["female"], variable=self.gender_var, value="female", command=self.on_gender_change, fg_color=PINK_COLOR, hover_color="#c20068")
        self.female_radio.pack(side="left", padx=5)
        
        self.male_radio = ctk.CTkRadioButton(self.gender_frame, text=self.app.t["male"], variable=self.gender_var, value="male", command=self.on_gender_change, fg_color=PINK_COLOR, hover_color="#c20068")
        self.male_radio.pack(side="left", padx=5)
        
        self.preview_btn = ctk.CTkButton(self.gender_frame, text=self.app.t["preview"], width=70, height=28, fg_color="gray90", hover_color="gray80", text_color="black", command=self.preview_voice)
        self.preview_btn.pack(side="left", padx=(15, 0))

        # Metadata Frame (New!)
        self.meta_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.meta_frame.grid(row=4, column=0, padx=40, pady=(0, 15), sticky="ew")
        self.meta_frame.grid_columnconfigure(1, weight=1)
        self.meta_frame.grid_columnconfigure(3, weight=1)
        
        self.meta_title_var = ctk.StringVar()
        self.meta_author_var = ctk.StringVar()
        
        ctk.CTkLabel(self.meta_frame, text="Titre :", font=ctk.CTkFont(family=FONT_FAMILY, size=11, weight="bold")).grid(row=0, column=0, padx=(5, 2), sticky="w")
        self.meta_title_entry = ctk.CTkEntry(self.meta_frame, textvariable=self.meta_title_var, height=24, font=(FONT_FAMILY, 11))
        self.meta_title_entry.grid(row=0, column=1, padx=5, sticky="ew")
        
        ctk.CTkLabel(self.meta_frame, text="Auteur :", font=ctk.CTkFont(family=FONT_FAMILY, size=11, weight="bold")).grid(row=0, column=2, padx=(10, 2), sticky="w")
        self.meta_author_entry = ctk.CTkEntry(self.meta_frame, textvariable=self.meta_author_var, height=24, font=(FONT_FAMILY, 11))
        self.meta_author_entry.grid(row=0, column=3, padx=5, sticky="ew")

        # Cover Gallery Area (Scrollable horizontal)
        self.gallery_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.gallery_frame.grid(row=5, column=0, padx=40, pady=(0, 20), sticky="ew")
        self.gallery_frame.grid_remove() # Hidden by default
        
        self.gallery_label = ctk.CTkLabel(self.gallery_frame, text="📸 Choisir la couverture :", font=ctk.CTkFont(family=FONT_FAMILY, size=11, weight="bold"), text_color="gray50")
        self.gallery_label.pack(anchor="w", padx=5)
        
        self.gallery_scroll = ctk.CTkScrollableFrame(self.gallery_frame, height=120, orientation="horizontal", fg_color=("gray95", "gray85"))
        self.gallery_scroll.pack(fill="x", pady=5)
        self.gallery_buttons = [] # To keep track of buttons for feedback
        
        self.selected_cover_label = ctk.CTkLabel(self.gallery_frame, text="Aucune sélection", font=ctk.CTkFont(family=FONT_FAMILY, size=11, slant="italic"), text_color="gray60")
        self.selected_cover_label.pack(anchor="e", padx=10)

        # Action Buttons
        self.action_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.action_frame.grid(row=6, column=0, padx=40, pady=(0, 30), sticky="ew")
        
        self.start_btn = AnimatedButton(self.action_frame, text=self.app.t["start"], height=45, font=ctk.CTkFont(family=FONT_FAMILY, size=16, weight="bold"), fg_color=PINK_COLOR, hover_color="#c20068", text_color="white", command=self.start_conversion, state="disabled")
        self.start_btn.pack(side="right", padx=10, fill="x", expand=True)

        self.pause_btn = AnimatedButton(self.action_frame, text=self.app.t["pause"], height=45, fg_color="gray90", hover_color="gray80", text_color="black", command=self.toggle_pause)
        # self.pause_btn.pack(side="right", padx=10) # Hidden by default
        
        self.cancel_btn = AnimatedButton(self.action_frame, text=self.app.t["close"], height=45, fg_color="transparent", border_width=2, border_color="gray50", text_color="gray50", command=self.app.close_app)
        self.cancel_btn.pack(side="right", padx=(20, 0))

        self.open_folder_btn = AnimatedButton(self.action_frame, text=self.app.t["open_folder"], height=45, fg_color="gray90", hover_color="gray80", text_color="black", command=self.open_folder)
        self.edit_text_btn = AnimatedButton(self.action_frame, text="📝 Éditer", height=45, fg_color="gray90", hover_color="gray80", text_color="black", command=self.open_edit_folder)
        self.export_merged_btn = AnimatedButton(self.action_frame, text=self.app.t["export_merged"], height=45, fg_color="gray90", hover_color="gray80", text_color="black", command=self.export_merged)

    def update_texts(self):
        t = LANGUAGES[self.app.lang]
        self.drop_label.configure(text=t["drop_text"])
        self.start_btn.configure(text=t["start"])
        if self.is_converting:
             self.cancel_btn.configure(text=t["cancel"])
        else:
             self.cancel_btn.configure(text=t["close"])
        self.open_folder_btn.configure(text=t["open_folder"])
        self.export_merged_btn.configure(text=t["export_merged"])
        self.gender_label.configure(text=t["gender"])
        self.female_radio.configure(text=t["female"])
        self.male_radio.configure(text=t["male"])
        self.preview_btn.configure(text=t["preview"])
        if not self.is_converting and not self.file_queue:
            self.status_label.configure(text=t["ready"])

    def drop_file(self, event):
        data = event.data
        import re
        # Properly parse multiple paths (e.g. {path 1} path2 {path 3})
        paths = re.findall(r'\{.*?\}|\S+', data)
        paths = [p[1:-1] if p.startswith('{') else p for p in paths]
        self.load_files(paths)

    def browse_file(self, event=None):
        file_paths = filedialog.askopenfilenames(filetypes=[("Ebook Files", "*.epub *.pdf *.docx *.txt *.mobi *.azw3")])
        if file_paths:
            self.load_files(list(file_paths))

    def load_files(self, paths):
        for path in paths:
            self.add_file_to_queue(path)
        
        if self.file_queue:
            self.scroll_frame.grid()
            self.start_btn.configure(state="normal")
            self.start_btn.pack(side="right", padx=10, fill="x", expand=True)
            self.edit_text_btn.pack(side="right", padx=10, fill="x", expand=True)

    def add_file_to_queue(self, path):
        # Check if already in queue
        if any(f[0] == path for f in self.file_queue):
            return
            
        item = FileListItem(self.scroll_frame, path, self.remove_file_from_queue)
        item.pack(fill="x", padx=5, pady=2)
        self.file_queue.append((path, item))
        
        # Auto-scan metadata if it's the first file
        if len(self.file_queue) == 1:
            threading.Thread(target=self.analyze_file, args=(path,), daemon=True).start()
        
    def remove_file_from_queue(self, item_widget):
        for i, (path, widget) in enumerate(self.file_queue):
            if widget == item_widget:
                self.file_queue.pop(i)
                widget.destroy()
                break
        
        if not self.file_queue:
            self.scroll_frame.grid_remove()
            self.start_btn.configure(state="disabled")

    def analyze_file(self, path):
        try:
            # Calculate temp dir early
            folder = os.path.dirname(path)
            base_name = os.path.splitext(os.path.basename(path))[0]
            self.current_temp_dir = os.path.join(folder, f".{base_name}_tmp")
            if not os.path.exists(self.current_temp_dir): os.makedirs(self.current_temp_dir)
            
            # Temporary converter just for scanning
            temp_converter = Converter(path, "", "", 0, 0, on_images_callback=self.on_images_found)
            num_chapters, word_count, title, author = temp_converter.scan_file()
            
            def _update():
                if not self.meta_title_var.get():
                    self.meta_title_var.set(title)
                if not self.meta_author_var.get():
                    self.meta_author_var.set(author)
                # If there's an info label, update it
                # self.file_info_label.configure(text=f"{num_chapters} chapitres | {word_count} mots")
            self.after(0, _update)
            
        except Exception as e:
            print(f"Error analyzing file: {e}")

    def update_status_led(self, color):
        """Update the connection status LED color."""
        # Map simple colors to hex
        colors = {
            "green": "#2ECC71",
            "orange": "#F39C12",
            "red": "#E74C3C",
            "gray": "#95A5A6"
        }
        self.status_led_canvas.itemconfig(self.status_led, fill=colors.get(color, "gray"), outline=colors.get(color, "gray"))

    def start_conversion(self):
        if not self.file_queue: return
        
        # Validation of Cover Selection
        if not self.selected_cover_path:
            choice = tk.messagebox.askyesnocancel("Pochette", 
                "Vous n'avez pas sélectionné de pochette personnalisée.\n\n"
                "- 'Oui' : Utiliser la détection automatique (celle du livre).\n"
                "- 'Non' : Choisir une image maintenant.\n"
                "- 'Annuler' : Arrêter.")
            
            if choice is None: # Cancel
                return
            if choice is False: # No -> Choose now
                # Try to scroll or highlight gallery? Or just return and let them click
                self.log_message("Veuillez sélectionner une image dans la galerie ou en ajouter une avec le bouton (+).")
                return
            # choice is True -> Proceed with auto-detection
        else:
            # Confirm the selected one
            self.log_message(f"🚀 Démarrage avec la pochette : {os.path.basename(self.selected_cover_path)}")

        self.is_converting = True
        self.start_btn.configure(state="disabled", fg_color="white", text_color=PINK_COLOR, border_width=2, border_color=PINK_COLOR)
        self.cancel_btn.configure(text=self.app.t["cancel"])
        self.pause_btn.pack(side="right", padx=10)
        self.status_label.configure(text=self.app.t["converting"])
        self.histogram.set_progress(0)
        self.update_status_led("green")
        
        threading.Thread(target=self.run_batch_conversion, daemon=True).start()

    def run_batch_conversion(self):
        gender = self.gender_var.get()
        voice = self.app.voice_female_var.get() if gender == "female" else self.app.voice_male_var.get()
        rate = self.app.rate_var.get()
        volume = self.app.volume_var.get()
        ffmpeg_path = self.app.ffmpeg_path_var.get()
        keep_mp3s = self.app.keep_mp3s_var.get()
        keep_global_mp3 = self.app.keep_global_mp3_var.get()
        embed_text = self.app.embed_text_var.get()
        max_parallel = self.app.parallel_var.get()
        
        error_msgs = []
        
        # Clone the queue to avoid issues if files are removed during processing
        queue_to_process = list(self.file_queue)
        
        for i, (path, widget) in enumerate(queue_to_process):
            if self.converter and self.converter.cancel_requested:
                break
                
            # Highlight current item
            self.after(0, lambda w=widget: w.configure(fg_color="#feeef5", border_width=1, border_color=PINK_COLOR))
            self.after(0, lambda p=path, idx=i: self.status_label.configure(text=f"[{idx+1}/{len(queue_to_process)}] {os.path.basename(p)}"))
            
            finished_event = threading.Event()
            
            def on_finished(success, msg, p=path, w=widget):
                finished_event.set()
                if not success:
                    error_msgs.append(f"{os.path.basename(p)} : {msg}")
                    self.after(0, lambda: w.configure(fg_color="#ffebee")) # Error color
                else:
                    self.after(0, lambda: w.configure(fg_color="#e8f5e9")) # Success color
                    # Remove from visual queue once done? No, keep it but mark success
                    # self.after(0, lambda: self.remove_file_from_queue(w))

            self.converter = Converter(
                path, ffmpeg_path, voice, rate, volume, keep_mp3s, max_parallel,
                progress_callback=self.update_progress,
                log_callback=self.log_message,
                finished_callback=on_finished,
                text_callback=self.update_scrolling_text,
                on_status_change=self.update_status_led,
                keep_global_mp3=keep_global_mp3,
                embed_text=embed_text,
                on_images_callback=self.on_images_found,
                meta_title=self.meta_title_var.get(),
                meta_artist=self.meta_author_var.get(),
                manual_cover_path=self.selected_cover_path
            )
            
            self.after(0, lambda: self.gallery_frame.grid_remove()) # Hide gallery at start of new file
            
            self.converter.run()
            finished_event.wait()

        # Batch finished
        if error_msgs:
            error_text = "\n".join(error_msgs)
            self.after(0, lambda: self.conversion_finished(False, f"Des erreurs sont survenues :\n{error_text}"))
        else:
            self.after(0, lambda: self.conversion_finished(True, "Toutes les conversions sont terminées !"))

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

    def on_voice_lang_change(self, choice):
        lang_code = self.display_to_lang.get(choice, "fr")
        self.voice_lang_var.set(lang_code)
        
        # Update default voice vars for settings
        voice_data = DEFAULT_VOICES.get(lang_code, DEFAULT_VOICES.get("en"))
        self.app.voice_male_var.set(voice_data.get("Male", ""))
        self.app.voice_female_var.set(voice_data.get("Female", ""))

    def on_gender_change(self):
        pass # Voice is now derived dynamically at conversion time

    def preview_voice(self):
        gender = self.gender_var.get()
        voice = self.app.voice_female_var.get() if gender == "female" else self.app.voice_male_var.get()
        rate = self.app.rate_var.get()
        volume = self.app.volume_var.get()
        text = "Bonjour, je suis votre voix pour ce livre audio. J'espère qu'elle vous plaira."
        if "en-" in voice:
            text = "Hello, I am your voice for this audiobook. I hope you like it."
            
        threading.Thread(target=self._run_preview, args=(text, voice, rate, volume), daemon=True).start()

    def _run_preview(self, text, voice, rate, volume):
        try:
            import edge_tts
            import tempfile
            import subprocess
            
            temp_mp3 = os.path.join(tempfile.gettempdir(), "preview.mp3")
            communicate = edge_tts.Communicate(text, voice, rate=f"{rate:+d}%", volume=f"{volume:+d}%")
            asyncio.run(communicate.save(temp_mp3))
            
            # Use bundled ffplay (next to ffmpeg)
            ffmpeg_path = self.app.ffmpeg_path_var.get()
            ffplay_path = ffmpeg_path.replace('ffmpeg.exe', 'ffplay.exe')
            
            if os.path.exists(ffplay_path):
                creationflags = 0
                if os.name == 'nt':
                    creationflags = subprocess.CREATE_NO_WINDOW
                subprocess.run([ffplay_path, "-nodisp", "-autoexit", temp_mp3], capture_output=True, creationflags=creationflags)
            else:
                # Fallback to system startfile
                os.startfile(temp_mp3)
        except Exception as e:
            print(f"Preview failed: {e}")

    def toggle_pause(self):
        if not self.converter: return
        
        if self.converter.pause_event.is_set():
            self.converter.pause_event.clear()
            self.pause_btn.configure(text=self.app.t["resume"])
            self.status_label.configure(text="PAUSE")
        else:
            self.converter.pause_event.set()
            self.pause_btn.configure(text=self.app.t["pause"])
            self.status_label.configure(text=self.app.t["converting"])

    def conversion_finished(self, success, msg):
        self.is_converting = False
        def _update():
            self.start_btn.configure(state="normal", fg_color=PINK_COLOR, text_color="white", border_width=0)
            self.start_btn.pack(side="right", padx=10, fill="x", expand=True)
            self.cancel_btn.configure(text=self.app.t["close"])
            self.pause_btn.pack_forget()
            
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
        if self.file_queue:
            folder = os.path.dirname(self.file_queue[0][0])
            open_file_explorer(folder)

    def open_edit_folder(self):
        if self.file_queue:
            path = self.file_queue[0][0]
            folder = os.path.dirname(path)
            base_name = os.path.splitext(os.path.basename(path))[0]
            temp_dir = os.path.join(folder, f".{base_name}_tmp")
            
            if not os.path.exists(temp_dir):
                # Trigger a quick extraction if not exists
                tk.messagebox.showinfo("Édition", "Extraction initiale en cours... Veuillez patienter quelques secondes.")
                def _extract():
                    try:
                        c = Converter(path, "", "", 0, 0)
                        # We need to set temp_dir for it to work
                        c.temp_dir = temp_dir
                        if not os.path.exists(temp_dir): os.makedirs(temp_dir)
                        chapters = c.extract_text(path)
                        import json
                        with open(os.path.join(temp_dir, "chapters.json"), 'w', encoding='utf-8') as f:
                            json.dump(chapters, f, ensure_ascii=False, indent=2)
                        self.after(0, lambda: open_file_explorer(temp_dir))
                    except Exception as e:
                        self.after(0, lambda: tk.messagebox.showerror("Erreur", f"Échec de l'extraction : {e}"))
                threading.Thread(target=_extract, daemon=True).start()
            else:
                open_file_explorer(temp_dir)

    def export_merged(self):
        if not self.file_queue: return
        
        base_name = os.path.splitext(os.path.basename(self.file_queue[0][0]))[0]
        default_name = f"{base_name}.m4b"
        
        file_path = filedialog.asksaveasfilename(
            defaultextension=".m4b",
            filetypes=[("Audiobook", "*.m4b")],
            initialfile=default_name,
            title=self.app.t["export_title"]
        )
        if file_path:
            source = os.path.join(os.path.dirname(self.file_queue[0][0]), default_name)
            if os.path.exists(source):
                shutil.copy(source, file_path)
                messagebox.showinfo("Export", "Fichier exporté avec succès.")

    def on_images_found(self, images):
        self.after(0, lambda: self._populate_gallery(images))

    def _populate_gallery(self, images):
        # Clear previous gallery buttons
        for widget in self.gallery_scroll.winfo_children():
            widget.destroy()
        self.gallery_buttons = []
            
        # Add "Add Custom" button
        try:
            add_btn = tk.Button(self.gallery_scroll, text="➕\nAjouter", 
                               command=self.browse_custom_cover,
                               font=(FONT_FAMILY, 10, "bold"),
                               fg=PINK_COLOR, bg="white", 
                               width=10, height=5,
                               relief="flat", borderwidth=2)
            add_btn.pack(side="left", padx=5, pady=5)
        except Exception as e:
            print(f"Error adding custom btn: {e}")

        if not images:
            self.gallery_frame.grid() # Still show frame for custom button
            return
            
        import io
        from PIL import Image, ImageTk
        
        found_any = False
        for name, content in images:
            try:
                ext = os.path.splitext(name)[1].lower()
                if ext not in ['.jpg', '.jpeg', '.png', '.webp']: continue
                
                img_data = io.BytesIO(content)
                pil_img = Image.open(img_data)
                
                # Thumbnail
                pil_img.thumbnail((80, 80))
                tk_img = ImageTk.PhotoImage(pil_img)
                
                btn = tk.Button(self.gallery_scroll, image=tk_img, 
                               command=lambda c=content, n=name, b=None: self.set_cover(c, n, b), 
                               bg="white", activebackground=PINK_COLOR, borderwidth=3, relief="flat", padx=2, pady=2)
                # Fix the lambda capturing issue by passing the button itself later
                btn.configure(command=lambda c=content, n=name, b=btn: self.set_cover(c, n, b))
                
                btn.image = tk_img # Keep reference
                btn.pack(side="left", padx=5, pady=5)
                self.gallery_buttons.append(btn)
                found_any = True
            except Exception as e:
                print(f"Gallery error for {name}: {e}")
                continue
        
        self.gallery_frame.grid()

    def browse_custom_cover(self):
        file_path = filedialog.askopenfilename(filetypes=[("Images", "*.jpg *.jpeg *.png *.webp")])
        if file_path:
            try:
                with open(file_path, "rb") as f:
                    content = f.read()
                name = os.path.basename(file_path)
                self.set_cover(content, name, None)
                
                # Add a temporary thumbnail for this custom cover? 
                # For now just set it and log.
                self.log_message(f"📸 Pochette personnalisée chargée : {name}")
            except Exception as e:
                self.log_message(f"❌ Erreur chargement pochette : {e}")

    def set_cover(self, content, name, selected_btn=None):
        # Visual feedback
        for btn in self.gallery_buttons:
            btn.configure(bg="white", highlightbackground="white")
        
        if selected_btn:
            selected_btn.configure(bg=PINK_COLOR)
            
        ext = os.path.splitext(name)[1] or ".jpg"
        
        # Save to a stable path in the current temp dir if possible
        if self.current_temp_dir:
            if not os.path.exists(self.current_temp_dir): os.makedirs(self.current_temp_dir)
            save_path = os.path.join(self.current_temp_dir, f"selected_cover{ext}")
            with open(save_path, "wb") as f:
                f.write(content)
            self.selected_cover_path = save_path
        else:
            # Fallback to system temp
            with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
                tmp.write(content)
                self.selected_cover_path = tmp.name
            
        # If conversion is already running, update it on the fly
        if self.converter:
            self.converter.cover_path = self.selected_cover_path
            self.converter.manual_cover_set = True
            
        self.selected_cover_label.configure(text=f"✅ Sélectionnée : {name}", text_color=PINK_COLOR)
        self.log_message(f"📸 Couverture enregistrée et confirmée : {name}")
        self.update_scrolling_text(f"Pochette validée : {name}")

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
        
        self.lang_label = ctk.CTkLabel(self.settings_frame, text=self.app.t["target_lang"], font=ctk.CTkFont(family=FONT_FAMILY, size=12, weight="bold"))
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
        t = LANGUAGES[self.app.lang]
        self.drop_label.configure(text=t["drop_text"])
        self.lang_label.configure(text=t["target_lang"])
        self.start_btn.configure(text=t["translate"])
        if not self.is_translating:
             self.cancel_btn.configure(text=t["close"])
        if not self.is_translating and not self.file_path:
            self.status_label.configure(text=t["ready"])
            
        # Update language list to reflect new interface language
        self.update_language_list()

    def update_language_list(self):
        current_code = self.display_to_code.get(self.target_lang_var.get(), "fr")
        
        self.display_to_code = {}
        display_values = []
        
        # Use GLOBAL_LANG_NAMES to populate the list
        codes = sorted(GLOBAL_LANG_NAMES.keys())
        
        for code in codes:
            # Format: "Local Name - English Name"
            english_name = GLOBAL_LANG_NAMES[code]
            
            # If we have a translation for this language code, use it
            if code in LANGUAGES:
                 local_name = LANGUAGES[code]["name"]
            else:
                 local_name = english_name
            
            interface_name = LANGUAGES[self.app.lang]["lang_names"].get(code, english_name)
            
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
        file_path = filedialog.askopenfilename(filetypes=[("All Supported Files", "*.epub *.pdf *.docx *.txt *.mobi *.azw3"), ("EPUB Files", "*.epub"), ("PDF Files", "*.pdf"), ("DOCX Files", "*.docx"), ("MOBI Files", "*.mobi *.azw3")])
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
            image_path = SCRIPT_DIR / "assets" / "splash_logo.png"
            if image_path.exists():
                pil_image = Image.open(image_path)
                # Resize if too big
                pil_image.thumbnail((380, 280))
                self.image = ImageTk.PhotoImage(pil_image)
                tk.Label(self, image=self.image, bg='white').pack(expand=True)
            else:
                tk.Label(self, text="AudioLivreur", font=("Arial", 24, "bold"), bg='white', fg=PINK_COLOR).pack(expand=True)
            
            # Version & GitHub Info (Always shown)
            tk.Label(self, text=f"AudioLivreur {parent.full_version}", font=("Arial", 10), bg='white').pack()
            github_btn = tk.Label(self, text=parent.t["visit_github"], fg="blue", bg="white", cursor="hand2", font=("Segoe UI", 10, "underline"))
            github_btn.pack(pady=(5, 10))
            github_btn.bind("<Button-1>", lambda e: webbrowser.open(parent.t["github_url"]))
            
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
        
        # Detect Version (Full or Light)
        if getattr(sys, 'frozen', False):
            # Running as compiled executable
            try:
                exe_size = os.path.getsize(sys.executable)
                self.is_full = exe_size > 100 * 1024 * 1024 # 100 MB threshold
            except:
                self.is_full = (SCRIPT_DIR / "ffmpeg.exe").exists()
        else:
            # Running as script
            self.is_full = (SCRIPT_DIR / "bin" / "ffmpeg.exe").exists()
            
        self.version_type = " (Full)" if self.is_full else " (Light)"
        self.full_version = f"v0.8.5{self.version_type}"
        
        self.title(f"AudioLivreur {self.full_version}")
        self.geometry("800x850") 
        self.resizable(True, True)
        self.minsize(800, 850)
        self.configure(fg_color=("#ffffff", "#1a1a1a"))
        
        # Set Icon
        try:
            icon_path = SCRIPT_DIR / "assets" / "app_icon.png"
            if icon_path.exists():
                # Window Icon
                icon_image = Image.open(icon_path)
                self.iconphoto(True, ImageTk.PhotoImage(icon_image))
                # Taskbar Icon (Windows only)
                if os.name == 'nt':
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
        self.voice_male_var = tk.StringVar(value="fr-FR-RemyMultilingualNeural")
        self.voice_female_var = tk.StringVar(value="fr-FR-VivienneMultilingualNeural")
        self.rate_var = tk.IntVar(value=0)
        self.volume_var = tk.IntVar(value=0)
        self.parallel_var = tk.IntVar(value=3)
        self.keep_mp3s_var = tk.BooleanVar(value=True)
        self.keep_global_mp3_var = tk.BooleanVar(value=True)
        self.embed_text_var = tk.BooleanVar(value=True)
        self.ffmpeg_path_var = tk.StringVar(value=get_default_ffmpeg_path())
        
        self.available_voices = []
        self.voices_loaded = False
        threading.Thread(target=self.load_voices_bg, daemon=True).start()
        
        # Load flag images
        try:
            self.fr_flag = ctk.CTkImage(Image.open(SCRIPT_DIR / "assets" / "french_flag.png"), size=(24, 16))
            self.en_flag = ctk.CTkImage(Image.open(SCRIPT_DIR / "assets" / "english_flag.png"), size=(24, 16))
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
        
        self.dark_mode_var = ctk.BooleanVar(value=False)
        self.dark_mode_btn = ctk.CTkButton(
            self.header_frame, 
            text="🌙" if not self.dark_mode_var.get() else "☀️", 
            width=30, 
            height=24, 
            fg_color="gray90", 
            hover_color="gray80", 
            text_color="black", 
            command=self.toggle_dark_mode
        )
        self.dark_mode_btn.pack(side="right", padx=(0, 10))

        # 2. Toggle Switch (Translation / Conversion)
        self.toggle_frame = ctk.CTkFrame(self.main_container, fg_color=("gray90", "gray20"), corner_radius=10, height=40)
        self.toggle_frame.grid(row=1, column=0, padx=60, pady=(10, 20), sticky="ew")
        self.toggle_frame.grid_columnconfigure(0, weight=1)
        self.toggle_frame.grid_columnconfigure(1, weight=1)
        
        self.trans_btn = ctk.CTkButton(self.toggle_frame, text=self.t["tab_trans"], fg_color="transparent", text_color="gray50", hover_color=("gray85", "gray25"), corner_radius=8, command=self.show_translation)
        self.trans_btn.grid(row=0, column=0, sticky="nsew", padx=2, pady=2)
        
        self.conv_btn = ctk.CTkButton(self.toggle_frame, text=self.t["tab_conv"], fg_color=("white", "gray25"), text_color="black", hover_color=("white", "gray25"), corner_radius=8, command=self.show_conversion)
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

    def toggle_dark_mode(self):
        if self.dark_mode_var.get():
            ctk.set_appearance_mode("Light")
            self.dark_mode_var.set(False)
            self.dark_mode_btn.configure(text="🌙")
        else:
            ctk.set_appearance_mode("Dark")
            self.dark_mode_var.set(True)
            self.dark_mode_btn.configure(text="☀️")

    def show_translation(self):
        self.conversion_frame.pack_forget()
        self.translation_frame.pack(fill="both", expand=True)
        
        # Update Toggle Style
        self.trans_btn.configure(fg_color=("white", "gray25"), text_color=("black", "white"))
        self.conv_btn.configure(fg_color="transparent", text_color="gray50")

    def show_conversion(self):
        self.translation_frame.pack_forget()
        self.conversion_frame.pack(fill="both", expand=True)
        
        # Update Toggle Style
        self.conv_btn.configure(fg_color=("white", "gray25"), text_color=("black", "white"))
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
            frame = ctk.CTkFrame(parent, fg_color="transparent")
            frame.pack(fill="x", pady=(5, 10))
            
            ctk.CTkLabel(frame, text=label_text, width=120, anchor="w", font=ctk.CTkFont(family=FONT_FAMILY, size=12)).pack(side="left")
            
            value_label = ctk.CTkLabel(frame, text=format_str.format(variable.get()), width=50, font=ctk.CTkFont(family=FONT_FAMILY, size=12, weight="bold"))
            
            def change_value(delta):
                new_val = variable.get() + delta
                if min_val <= new_val <= max_val:
                    variable.set(new_val)
                    value_label.configure(text=format_str.format(new_val))
            
            btn_minus = ctk.CTkButton(frame, text="-", width=30, height=28, fg_color=PINK_COLOR, hover_color="#c20068", text_color="white", command=lambda: change_value(-step))
            btn_minus.pack(side="left", padx=(10, 5))
            
            value_label.pack(side="left", padx=5)
            
            btn_plus = ctk.CTkButton(frame, text="+", width=30, height=28, fg_color=PINK_COLOR, hover_color="#c20068", text_color="white", command=lambda: change_value(step))
            btn_plus.pack(side="left", padx=(5, 0))
        except Exception as e:
            logging.error(f"Error creating stepper for {label_text}: {e}")

    def toggle_settings(self):
        try:
            if self.settings_window is not None and self.settings_window.winfo_exists():
                self.settings_window.focus()
                return

            self.settings_window = ctk.CTkToplevel(self)
            self.settings_window.title(self.t["settings"])
            self.settings_window.geometry("520x650")
            self.settings_window.configure(fg_color=("#ffffff", "#1a1a1a"))
            self.settings_window.attributes("-topmost", True)
            self.settings_window.protocol("WM_DELETE_WINDOW", self.close_settings)
            
            # Scrollable frame for settings if they grow
            layout = ctk.CTkScrollableFrame(self.settings_window, fg_color="transparent")
            layout.pack(fill="both", expand=True, padx=20, pady=20)
            
            # Voice Selection (Male & Female)
            ctk.CTkLabel(layout, text=self.t.get("voice_male", "Voix Homme (Défaut)"), font=ctk.CTkFont(family=FONT_FAMILY, size=12, weight="bold")).pack(anchor="w", pady=(0, 5))
            
            if not self.voices_loaded:
                voice_m_values = [self.t["loading_voices"]]
                voice_f_values = [self.t["loading_voices"]]
            elif self.available_voices:
                lang_prefix = self.lang + "-"
                male_voices = [v['ShortName'] for v in self.available_voices if v.get('Gender') == 'Male' and v['ShortName'].startswith(lang_prefix)]
                female_voices = [v['ShortName'] for v in self.available_voices if v.get('Gender') == 'Female' and v['ShortName'].startswith(lang_prefix)]
                
                # Fallback to all if empty
                if not male_voices: male_voices = [v['ShortName'] for v in self.available_voices if v.get('Gender') == 'Male']
                if not female_voices: female_voices = [v['ShortName'] for v in self.available_voices if v.get('Gender') == 'Female']
                
                voice_m_values = male_voices
                voice_f_values = female_voices
            else:
                voice_m_values = [self.t["no_voices"]]
                voice_f_values = [self.t["no_voices"]]
                
            voice_m_combo = ctk.CTkComboBox(layout, values=voice_m_values, variable=self.voice_male_var, width=400)
            voice_m_combo.pack(fill="x", pady=(0, 10))

            ctk.CTkLabel(layout, text=self.t.get("voice_female", "Voix Femme (Défaut)"), font=ctk.CTkFont(family=FONT_FAMILY, size=12, weight="bold")).pack(anchor="w", pady=(0, 5))
            voice_f_combo = ctk.CTkComboBox(layout, values=voice_f_values, variable=self.voice_female_var, width=400)
            voice_f_combo.pack(fill="x", pady=(0, 20))
            
            # Rate Stepper
            self.create_stepper(layout, self.t["rate"], self.rate_var, -50, 50, 10, format_str="{:+d}%")
            
            # Volume Stepper
            self.create_stepper(layout, self.t["volume"], self.volume_var, -50, 50, 10, format_str="{:+d}%")
            
            # Parallel Stepper
            self.create_stepper(layout, self.t["parallel"], self.parallel_var, 1, 10, 1, format_str="{:d}")
            
            # FFmpeg Path
            ctk.CTkLabel(layout, text=self.t["ffmpeg"], font=ctk.CTkFont(family=FONT_FAMILY, size=12, weight="bold")).pack(anchor="w", pady=(10, 5))
            ffmpeg_frame = ctk.CTkFrame(layout, fg_color="transparent")
            ffmpeg_frame.pack(fill="x", pady=(0, 5))
            
            ctk.CTkEntry(ffmpeg_frame, textvariable=self.ffmpeg_path_var).pack(side="left", fill="x", expand=True)
            ctk.CTkButton(ffmpeg_frame, text="📂", width=40, height=28, fg_color=PINK_COLOR, hover_color="#c20068", text_color="white", command=self.browse_ffmpeg).pack(side="right", padx=(10, 0))
            
            # FFmpeg Download Link
            ffmpeg_link = ctk.CTkLabel(layout, text=self.t["download_ffmpeg"], text_color=PINK_COLOR, cursor="hand2", font=ctk.CTkFont(family=FONT_FAMILY, size=12, underline=True))
            ffmpeg_link.pack(anchor="w", pady=(0, 20))
            ffmpeg_link.bind("<Button-1>", lambda e: self.open_ffmpeg_download())
            
            # MP3 Settings
            ctk.CTkCheckBox(layout, text=self.t["keep_mp3"], variable=self.keep_mp3s_var, fg_color=PINK_COLOR, hover_color="#c20068").pack(anchor="w", pady=5)
            ctk.CTkCheckBox(layout, text=self.t["keep_global_mp3"], variable=self.keep_global_mp3_var, fg_color=PINK_COLOR, hover_color="#c20068").pack(anchor="w", pady=5)
            ctk.CTkCheckBox(layout, text=self.t["embed_text"], variable=self.embed_text_var, fg_color=PINK_COLOR, hover_color="#c20068").pack(anchor="w", pady=(0, 20))
            
            # GitHub Link & Support
            github_label = ctk.CTkLabel(layout, text=self.t["visit_github"], text_color=PINK_COLOR, cursor="hand2", font=ctk.CTkFont(family=FONT_FAMILY, size=12, underline=True))
            github_label.pack(anchor="w", pady=(10, 0))
            github_label.bind("<Button-1>", lambda e: webbrowser.open(self.t["github_url"]))
            
            # Version info at bottom
            tk.Label(layout, text=f"AudioLivreur {self.full_version}", bg="white", fg="gray", font=("Arial", 8)).pack(side="bottom", pady=(5, 0))

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
    log_file = "AudioLivreur-v0.8.5-Full.log"
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
