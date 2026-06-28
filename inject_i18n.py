import re

new_keys = {
    'fr': {
        'toast_test_playing': 'Lecture audio en cours...',
        'toast_test_err': 'Serveur temporairement indisponible. Réessayez.',
        'toast_lang_detected': '🌍 Langue détectée automatiquement : {lang}',
        'toast_parse_err': 'Erreur d\'analyse : {err}',
        'toast_file_err': 'Impossible de lire le fichier : {err}',
        'funny_1': 'Le chef mixe les fréquences...',
        'funny_2': 'Les ondes sonores prennent un café...',
        'funny_3': 'On chauffe les cordes vocales numériques...',
        'funny_4': 'La magie opère dans les câbles...',
        'funny_5': 'Préparation du chef-d\'œuvre audio...'
    },
    'en': {
        'toast_test_playing': 'Audio playback in progress...',
        'toast_test_err': 'Server temporarily unavailable. Try again.',
        'toast_lang_detected': '🌍 Language automatically detected: {lang}',
        'toast_parse_err': 'Parsing error: {err}',
        'toast_file_err': 'Unable to read file: {err}',
        'funny_1': 'The chef is mixing frequencies...',
        'funny_2': 'Sound waves are taking a coffee break...',
        'funny_3': 'Warming up the digital vocal cords...',
        'funny_4': 'Magic is happening in the cables...',
        'funny_5': 'Preparing the audio masterpiece...'
    },
    'es': {
        'toast_test_playing': 'Reproducción de audio en curso...',
        'toast_test_err': 'Servidor temporalmente no disponible. Inténtalo de nuevo.',
        'toast_lang_detected': '🌍 Idioma detectado automáticamente: {lang}',
        'toast_parse_err': 'Error de análisis: {err}',
        'toast_file_err': 'Imposible leer el archivo: {err}',
        'funny_1': 'El chef mezcla las frecuencias...',
        'funny_2': 'Las ondas sonoras están tomando un café...',
        'funny_3': 'Calentando las cuerdas vocales digitales...',
        'funny_4': 'La magia ocurre en los cables...',
        'funny_5': 'Preparando la obra maestra de audio...'
    },
    'de': {
        'toast_test_playing': 'Audiowiedergabe läuft...',
        'toast_test_err': 'Server vorübergehend nicht erreichbar. Erneut versuchen.',
        'toast_lang_detected': '🌍 Sprache automatisch erkannt: {lang}',
        'toast_parse_err': 'Analysefehler: {err}',
        'toast_file_err': 'Datei kann nicht gelesen werden: {err}',
        'funny_1': 'Der Chef mischt die Frequenzen...',
        'funny_2': 'Schallwellen machen Kaffeepause...',
        'funny_3': 'Digitale Stimmbänder werden aufgewärmt...',
        'funny_4': 'Magie in den Kabeln...',
        'funny_5': 'Audiomeisterwerk wird vorbereitet...'
    },
    'it': {
        'toast_test_playing': 'Riproduzione audio in corso...',
        'toast_test_err': 'Server temporaneamente non disponibile. Riprova.',
        'toast_lang_detected': '🌍 Lingua rilevata automaticamente: {lang}',
        'toast_parse_err': 'Errore di analisi: {err}',
        'toast_file_err': 'Impossibile leggere il file: {err}',
        'funny_1': 'Lo chef sta mescolando le frequenze...',
        'funny_2': 'Le onde sonore stanno prendendo un caffè...',
        'funny_3': 'Riscaldamento delle corde vocali digitali...',
        'funny_4': 'La magia sta avvenendo nei cavi...',
        'funny_5': 'Preparazione del capolavoro audio...'
    },
    'pt': {
        'toast_test_playing': 'Reprodução de áudio em andamento...',
        'toast_test_err': 'Servidor temporariamente indisponível. Tente novamente.',
        'toast_lang_detected': '🌍 Idioma detectado automaticamente: {lang}',
        'toast_parse_err': 'Erro de análise: {err}',
        'toast_file_err': 'Não foi possível ler o arquivo: {err}',
        'funny_1': 'O chef está misturando as frequências...',
        'funny_2': 'As ondas sonoras estão tomando um café...',
        'funny_3': 'Aquecendo as cordas vocais digitais...',
        'funny_4': 'A magia acontece nos cabos...',
        'funny_5': 'Preparando a obra-prima de áudio...'
    },
    'ru': {
        'toast_test_playing': 'Идет воспроизведение аудио...',
        'toast_test_err': 'Сервер временно недоступен. Попробуйте еще раз.',
        'toast_lang_detected': '🌍 Язык определен автоматически: {lang}',
        'toast_parse_err': 'Ошибка анализа: {err}',
        'toast_file_err': 'Невозможно прочитать файл: {err}',
        'funny_1': 'Шеф смешивает частоты...',
        'funny_2': 'Звуковые волны пьют кофе...',
        'funny_3': 'Разогреваем цифровые голосовые связки...',
        'funny_4': 'Магия происходит в проводах...',
        'funny_5': 'Готовим аудио шедевр...'
    },
    'zh': {
        'toast_test_playing': '音频播放中...',
        'toast_test_err': '服务器暂时不可用。请重试。',
        'toast_lang_detected': '🌍 自动检测到语言：{lang}',
        'toast_parse_err': '解析错误：{err}',
        'toast_file_err': '无法读取文件：{err}',
        'funny_1': '厨师正在混合频率...',
        'funny_2': '声波正在喝咖啡...',
        'funny_3': '正在预热数字声带...',
        'funny_4': '电缆中正在发生魔法...',
        'funny_5': '正在准备音频杰作...'
    },
    'ja': {
        'toast_test_playing': '音声再生中...',
        'toast_test_err': 'サーバーは一時的に利用できません。再試行してください。',
        'toast_lang_detected': '🌍 自動検出された言語: {lang}',
        'toast_parse_err': '解析エラー: {err}',
        'toast_file_err': 'ファイルを読み取れません: {err}',
        'funny_1': 'シェフが周波数をミックスしています...',
        'funny_2': '音波がコーヒー休憩を取っています...',
        'funny_3': 'デジタル声帯をウォームアップしています...',
        'funny_4': 'ケーブルの中で魔法が起きています...',
        'funny_5': 'オーディオの傑作を準備中...'
    },
    'ar': {
        'toast_test_playing': 'جاري تشغيل الصوت...',
        'toast_test_err': 'الخادم غير متاح مؤقتا. حاول مرة أخرى.',
        'toast_lang_detected': '🌍 تم اكتشاف اللغة تلقائيا: {lang}',
        'toast_parse_err': 'خطأ في التحليل: {err}',
        'toast_file_err': 'تعذرت قراءة الملف: {err}',
        'funny_1': 'الطاهي يمزج الترددات...',
        'funny_2': 'الموجات الصوتية تتناول القهوة...',
        'funny_3': 'تسخين الحبال الصوتية الرقمية...',
        'funny_4': 'يحدث السحر في الكابلات...',
        'funny_5': 'تحضير التحفة الصوتية...'
    }
}

with open('js/i18n.js', 'r', encoding='utf-8') as f:
    content = f.read()

for lang, keys in new_keys.items():
    pattern = r'(\b' + lang + r'\s*:\s*\{)([\s\S]*?)(\n\s*\})'
    
    def repl(m):
        block_content = m.group(2)
        indent = "        "
        added_str = ""
        for k, v in keys.items():
            if f"\"{k}\":" not in block_content and f"{k}:" not in block_content:
                safe_v = v.replace('"', '\\"')
                added_str += f"{indent}{k}: \"{safe_v}\",\n"
        
        if added_str and block_content.strip() and not block_content.rstrip().endswith(','):
            idx = len(block_content.rstrip())
            block_content = block_content[:idx] + ",\n" + block_content[idx:]
            
        return m.group(1) + block_content + added_str + m.group(3)
    
    content = re.sub(pattern, repl, content)

with open('js/i18n.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done injecting new keys.')
