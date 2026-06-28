/**
 * Orchestrateur principal de l'application audiolivreur.ai (Messages Cools & Fun style Discord)
 */

document.addEventListener('DOMContentLoaded', () => {
    const ttsClient = new EdgeTtsClient();
    let currentBookData = null;
    let generatedAudioFiles = [];
    let isConverting = false;
    let cancelRequested = false;
    let currentFormat = 'm4b';

    // Discord-style funny loading messages are now in i18n
    function getRandomFunnyMessage() {
        return window.t(`funny_${Math.floor(Math.random() * 12) + 1}`);
    }

    // DOM Elements
    const elements = {
        toggleMp3: document.getElementById('toggleMp3'),
        toggleM4b: document.getElementById('toggleM4b'),
        formatHint: document.getElementById('formatHint'),
        lblDownloadFormat: document.getElementById('lblDownloadFormat'),

        selectLanguage: document.getElementById('selectLanguage'),
        selectVoice: document.getElementById('selectVoice'),
        selectThreads: document.getElementById('selectThreads'),
        btnTestVoice: document.getElementById('btnTestVoice'),
        rangeRate: document.getElementById('rangeRate'),
        valRate: document.getElementById('valRate'),
        rangePitch: document.getElementById('rangePitch'),
        valPitch: document.getElementById('valPitch'),

        dropzoneCard: document.getElementById('dropzoneCard'),
        dropzone: document.getElementById('dropzone'),
        fileInput: document.getElementById('fileInput'),
        btnBrowse: document.getElementById('btnBrowse'),

        bookDetailsCard: document.getElementById('bookDetailsCard'),
        coverPreview: document.getElementById('coverPreview'),
        coverPlaceholderIcon: document.getElementById('coverPlaceholderIcon'),
        metaTitle: document.getElementById('metaTitle'),
        metaAuthor: document.getElementById('metaAuthor'),
        statChapters: document.getElementById('statChapters'),
        statWords: document.getElementById('statWords'),
        statEstTime: document.getElementById('statEstTime'),
        chaptersList: document.getElementById('chaptersList'),
        btnStartConversion: document.getElementById('btnStartConversion'),
        btnReset: document.getElementById('btnReset'),

        progressCard: document.getElementById('progressCard'),
        progressStatusText: document.getElementById('progressStatusText'),
        progressPercentText: document.getElementById('progressPercentText'),
        progressBarFill: document.getElementById('progressBarFill'),
        metricWords: document.getElementById('metricWords'),
        metricSpeed: document.getElementById('metricSpeed'),
        metricEta: document.getElementById('metricEta'),
        consoleLogs: document.getElementById('consoleLogs'),
        metricsGrid: document.getElementById('metricsGrid'),
        btnCancelConversion: document.getElementById('btnCancelConversion'),

        finishedCard: document.getElementById('finishedCard'),
        btnDownloadAudiobook: document.getElementById('btnDownloadAudiobook'),
        btnDownloadMp3Zip: document.getElementById('btnDownloadMp3Zip'),
        btnDownloadTranscript: document.getElementById('btnDownloadTranscript'),
        btnNewConversion: document.getElementById('btnNewConversion'),

        modalOverlay: document.getElementById('modalOverlay'),
        modalTitle: document.getElementById('modalTitle'),
        modalBody: document.getElementById('modalBody'),
        btnCloseModal: document.getElementById('btnCloseModal'),
        btnOpenModalHow: document.getElementById('btnOpenModalHow'),
        btnOpenModalLegal: document.getElementById('btnOpenModalLegal'),
        btnOpenModalContact: document.getElementById('btnOpenModalContact'),
        btnOpenModalCredits: document.getElementById('btnOpenModalCredits')
    };

    // Custom UI Language Selector
    const langBtn = document.getElementById('langSelectorBtn');
    const langDropdown = document.getElementById('langSelectorDropdown');
    const langCurrent = document.getElementById('langSelectorCurrent');
    
    if (langBtn && langDropdown && langCurrent) {
        langBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = langDropdown.style.display === 'none';
            langDropdown.style.display = isHidden ? 'block' : 'none';
        });

        document.querySelectorAll('.custom-select-option').forEach(opt => {
            opt.addEventListener('click', (e) => {
                const val = opt.getAttribute('data-value');
                // Update current text to match selected option HTML but keep the chevron
                langCurrent.innerHTML = opt.innerHTML;
                langDropdown.style.display = 'none';
                localStorage.setItem('audiolivreur_lang', val);
                window.applyTranslations(val);
                if (typeof updateInterfaceAfterLangChange === 'function') {
                    updateInterfaceAfterLangChange();
                }
            });
        });

        // Close when clicking outside
        document.addEventListener('click', () => {
            langDropdown.style.display = 'none';
        });
    }

    // Fonction de mise à jour des textes dynamiques post-traduction
    function updateInterfaceAfterLangChange() {
            // Re-render programmatic strings if needed
            if(currentFormat === 'mp3') {
                elements.formatHint.innerHTML = window.t('format_hint_text');
            } else {
                elements.formatHint.innerHTML = window.t('format_m4b_hint_text') || `🔥 <strong>Mode M4B Unique (Attention les cuisses !) :</strong> Ton navigateur va faire de la musculation intensive pour tout fusionner. Risque de faire chauffer ton PC ou ton smartphone en mode radiateur d'appoint ! 🏋️‍♂️🔥`;
            }
            if (currentBookData && currentBookData.chapters.length > 0 && !isConverting) {
                // Update badge words label
                const totalWords = currentBookData.chapters.reduce((sum, ch) => sum + ch.text.split(/\\s+/).length, 0);
                const totalMinutes = Math.round(totalWords / 150);
                elements.statChapters.innerHTML = `<i class="fa-solid fa-list-ol"></i> <strong id="statChapters">${currentBookData.chapters.length}</strong> <span data-i18n="stat_chapters">${window.t('stat_chapters')}</span>`;
                elements.statWords.innerHTML = `<strong id="statWords">${totalWords.toLocaleString()}</strong> <span data-i18n="stat_words">${window.t('stat_words')}</span>`;
                elements.statEstTime.innerHTML = `<i class="fa-solid fa-clock"></i> ~<strong id="statEstTime">${totalMinutes > 60 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}min` : `${totalMinutes}`}</strong> <span data-i18n="stat_time_min">${window.t('stat_time_min')}</span>`;
                
                // Update chapter rows
                currentBookData.chapters.forEach((ch, idx) => {
                    const badge = document.getElementById(`chapter-badge-${idx}`);
                    if(badge) {
                        const wordCount = ch.text.split(/\\s+/).length;
                        badge.innerHTML = `<span id="chapter-status-${idx}"><i class="fa-solid fa-clock" style="color:var(--text-muted)"></i></span> &nbsp;${wordCount.toLocaleString()} ${window.t('stat_words')}`;
                    }
                });
            }
        }
        
        const savedLang = localStorage.getItem('audiolivreur_lang') || 'fr';
        // Set initial UI state
        const initialOpt = document.querySelector(`.custom-select-option[data-value="${savedLang}"]`);
        if (initialOpt && langCurrent) {
            langCurrent.innerHTML = initialOpt.innerHTML;
        }
        window.applyTranslations(savedLang);
        updateInterfaceAfterLangChange();

    // Toggle MP3 / M4B Format Handler avec textes super funs
    elements.toggleMp3.addEventListener('click', () => {
        currentFormat = 'mp3';
        elements.toggleMp3.classList.add('active');
        elements.toggleM4b.classList.remove('active');
        elements.formatHint.innerHTML = window.t('format_hint_text');
        if (elements.lblDownloadFormat) elements.lblDownloadFormat.textContent = `.zip MP3`;
    });

    elements.toggleM4b.addEventListener('click', () => {
        currentFormat = 'm4b';
        elements.toggleM4b.classList.add('active');
        elements.toggleMp3.classList.remove('active');
        elements.formatHint.innerHTML = window.t('format_m4b_hint_text') || `🔥 <strong>Mode M4B Unique (Attention les cuisses !) :</strong> Ton navigateur va faire de la musculation intensive pour tout fusionner. Risque de faire chauffer ton PC ou ton smartphone en mode radiateur d'appoint ! 🏋️‍♂️🔥`;
        if (elements.lblDownloadFormat) elements.lblDownloadFormat.textContent = `.m4b Unique`;
    });

    const sampleTextsByLang = {
        'fr': "Bonjour ! Ceci est un extrait de test de la voix sélectionnée pour votre livre audio.",
        'en': "Hello! This is a sample recording to test the selected neural voice for your audiobook.",
        'es': "¡Hola! Este es un fragmento de prueba para evaluar la voz seleccionada para tu libro hablado.",
        'de': "Hallo! Dies ist eine Hörprobe, um die ausgewählte Stimme für Ihr Hörbuch zu testen.",
        'it': "Ciao! Questo è un campione audio di prova per testare la voce selezionata per il tuo audiolibro.",
        'pt': "Olá! Este é um trecho de teste para avaliar a voz selecionada para o seu livro falado.",
        'nl': "Hallo! Dit is een proefopname om de geselecteerde stem voor uw luisterboek te testen.",
        'pl': "Cześć! To jest próbka dźwiękowa do przetestowania wybranego głosu dla Twojego audiobooka.",
        'ru': "Здравствуйте! Это тестовая аудиозапись для проверки выбранного голоса для вашей аудиокниги.",
        'ja': "こんにちは！これはオーディオブックの選択された音声を確認するためのテスト録音です。",
        'zh': "你好！这是用于测试您的有声读物所选语音的示例录音。",
        'ko': "안녕하세요! 오디오북에 선택한 음성을 테스트하기 위한 샘플 녹음입니다.",
        'ar': "مرحباً! هذا تسجيل عينة لاختبار الصوت العصبي المحدد للكتاب الصوتي الخاص بك.",
        'tr': "Merhaba! Bu, sesli kitabınız için seçilen sesi test etmek üzere hazırlanmış bir örnek kayıttır.",
        'hi': "नमस्कार! यह आपकी ऑडियोबुक के लिए चयनित आवाज का परीक्षण करने के लिए एक नमूना रिकॉर्डिंग है।"
    };

    function openModal(title, htmlContent) {
        elements.modalTitle.textContent = title;
        elements.modalBody.innerHTML = htmlContent;
        elements.modalOverlay.classList.remove('hidden');
    }

    function closeModal() {
        elements.modalOverlay.classList.add('hidden');
    }

    elements.btnCloseModal.addEventListener('click', closeModal);
    elements.modalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.modalOverlay) closeModal();
    });

    elements.btnOpenModalHow.addEventListener('click', () => {
        openModal("📖 Comment ça marche ?", `
            <p style="font-size:1.05rem; font-weight:600;">Hey ! Bienvenue sur audiolivreur.ai 👋 Transformer un bouquin en livre audio n'a jamais été aussi simple :</p>
            <div style="display:flex; flex-direction:column; gap:0.8rem; margin-top:0.4rem;">
                <div style="background:var(--bg-main); border:2px solid var(--border-black); padding:0.8rem 1rem; border-radius:10px;">
                    <strong>1. 📁 Glisse ton livre :</strong> Dépose ton fichier (EPUB, PDF, Word, TXT...). L'application extrait le texte et les chapitres instantanément.
                </div>
                <div style="background:var(--bg-main); border:2px solid var(--border-black); padding:0.8rem 1rem; border-radius:10px;">
                    <strong>2. 🎙️ Choisis le style vocal :</strong> Sélectionne la voix neuronale, le format (MP3 ou M4B) et ajuste la vitesse de lecture.
                </div>
                <div style="background:var(--bg-main); border:2px solid var(--border-black); padding:0.8rem 1rem; border-radius:10px;">
                    <strong>3. 🎧 Magie en direct !</strong> La voix est générée directement sur ton ordinateur. Télécharge tes fichiers audio et profite de ton livre partout !
                </div>
            </div>
        `);
    });

    elements.btnOpenModalLegal.addEventListener('click', () => {
        openModal("🔒 Zéro Tracas & 100% Privé", `
            <p style="font-size:1.05rem; font-weight:600;">Tes livres restent CHEZ TOI ! 🛡️</p>
            <p>Pas de cloud mystérieux, pas de serveur intermédiaire qui conserve tes fichiers. Toute la lecture, le découpage et l'assemblage de tes documents s'exécutent <strong>100% dans la mémoire de ton propre navigateur</strong>.</p>
            <p>Les requêtes vocales sont envoyées en direct depuis ton accès internet. Tes livres, tes données et ta vie privée t'appartiennent à 100% !</p>
        `);
    });

    elements.btnOpenModalContact.addEventListener('click', () => {
        openModal("⚡ Contacter le Créateur", `
            <p style="font-size:1.05rem; font-weight:600;">Une idée, une suggestion ou un mot doux ? 📬</p>
            <p>Cette application a été imaginée et développée par <strong>Julien</strong> pour rendre la création d'audiobooks accessible à tous, gratuitement et sans contraintes.</p>
            <div style="background:var(--accent-yellow); border:2px solid var(--border-black); padding:1rem; border-radius:10px; margin-top:0.5rem;">
                <p><strong>👤 Créateur :</strong> Julien</p>
                <p><strong>🌐 Code Source :</strong> Disponible sur <a href="https://github.com/jul1n/AudioLivreur" target="_blank" style="color:var(--text-main); font-weight:700;">GitHub</a></p>
            </div>
        `);
    });

    elements.btnOpenModalCredits.addEventListener('click', () => {
        openModal("✨ Crédits & Open-Source", `
            <p>Imaginé avec ❤️ par <strong>Julien</strong> et propulsé par la formidable communauté Open-Source :</p>
            <ul style="margin-left: 1.2rem; display: flex; flex-direction: column; gap: 0.5rem;">
                <li><strong>Microsoft Edge TTS API</strong> - Moteur de synthèse vocale neuronale haute définition.</li>
                <li><strong>JSZip</strong> - Gestion des archives et création des fichiers ZIP MP3.</li>
                <li><strong>PDF.js</strong> (Mozilla) - Lecture et extraction du texte des PDF.</li>
                <li><strong>Mammoth.js</strong> - Parseur de documents Microsoft Word (.docx).</li>
            </ul>
        `);
    });

    function updateVoiceSelect() {
        const lang = elements.selectLanguage.value;
        const voices = ttsClient.getVoices(lang);
        elements.selectVoice.innerHTML = '';

        voices.forEach(v => {
            const opt = document.createElement('option');
            opt.value = v.ShortName;
            opt.textContent = v.LocalName;
            elements.selectVoice.appendChild(opt);
        });

        const options = Array.from(elements.selectVoice.options);
        let preferred = options.find(o => o.value.includes('VivienneMultilingual'));
        if (!preferred) preferred = options.find(o => o.value.toLowerCase().includes('multilingual'));
        if (!preferred) preferred = options.find(o => o.value.includes('Remy'));
        if (!preferred && options.length > 0) preferred = options[0];

        if (preferred) {
            preferred.selected = true;
        }
    }

    updateVoiceSelect();
    elements.selectLanguage.addEventListener('change', updateVoiceSelect);

    elements.rangeRate.addEventListener('input', (e) => {
        elements.valRate.textContent = `${e.target.value >= 0 ? '+' : ''}${e.target.value}%`;
    });
    elements.rangePitch.addEventListener('input', (e) => {
        elements.valPitch.textContent = `${e.target.value >= 0 ? '+' : ''}${e.target.value}Hz`;
    });

    function log(msg, type = 'info') {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        const timeStr = new Date().toLocaleTimeString();
        entry.textContent = `[${timeStr}] ${msg}`;
        elements.consoleLogs.appendChild(entry);
        elements.consoleLogs.scrollTop = elements.consoleLogs.scrollHeight;
    }

    function showToast(msg, isError = false) {
        let toast = document.getElementById('appToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'appToast';
            toast.style.cssText = 'position:fixed; bottom:20px; right:20px; z-index:9999; padding:12px 20px; border-radius:10px; font-weight:700; font-family:sans-serif; border:3px solid #0f0f0f; box-shadow:4px 4px 0px #0f0f0f; transition:all 0.3s; opacity:0; transform:translateY(20px);';
            document.body.appendChild(toast);
        }
        toast.style.background = isError ? '#ff6b6b' : '#51cf66';
        toast.style.color = '#0f0f0f';
        toast.innerHTML = (isError ? '⚠️ ' : '✅ ') + msg;
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
        }, 4000);
    }

    elements.btnTestVoice.addEventListener('click', async () => {
        const lang = elements.selectLanguage.value;
        const voice = elements.selectVoice.value;
        const rate = parseInt(elements.rangeRate.value);
        const pitch = parseInt(elements.rangePitch.value);

        elements.btnTestVoice.disabled = true;
        elements.btnTestVoice.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Connexion Microsoft...`;

        try {
            const testText = sampleTextsByLang[lang] || sampleTextsByLang['fr'];
            await ttsClient.testVoice(testText, { voice, rate, pitch }, (status) => {
                elements.btnTestVoice.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${status}`;
            });
            showToast(window.t('toast_test_playing') || "Lecture audio en cours...");
        } catch (err) {
            console.warn("Test vocal : ", err);
            showToast(window.t('toast_test_err') || "Serveur temporairement indisponible. Réessayez.", true);
        } finally {
            elements.btnTestVoice.disabled = false;
            elements.btnTestVoice.innerHTML = `<i class="fa-solid fa-volume-high"></i> Tester la Voix`;
        }
    });

    elements.btnBrowse.addEventListener('click', () => elements.fileInput.click());

    elements.fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleFileSelect(e.target.files[0]);
    });

    ['dragenter', 'dragover'].forEach(name => {
        elements.dropzone.addEventListener(name, (e) => {
            e.preventDefault();
            elements.dropzone.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(name => {
        elements.dropzone.addEventListener(name, (e) => {
            e.preventDefault();
            elements.dropzone.classList.remove('dragover');
        });
    });

    elements.dropzone.addEventListener('drop', (e) => {
        if (e.dataTransfer.files.length > 0) handleFileSelect(e.dataTransfer.files[0]);
    });

    function detectLanguageSimple(text) {
        if (!text) return null;
        text = text.toLowerCase();
        const counters = { fr: 0, en: 0, es: 0, de: 0, it: 0, pt: 0, nl: 0 };
        const stopwords = {
            fr: ["le", "la", "les", "un", "une", "et", "dans", "pour", "qui", "que", "je", "tu", "il", "est", "pas", "sur", "avec", "ce", "se"],
            en: ["the", "and", "to", "of", "a", "in", "is", "that", "it", "with", "as", "for", "on", "was", "at", "this", "be"],
            es: ["el", "la", "los", "las", "un", "una", "y", "en", "para", "que", "de", "con", "por", "como", "su", "lo"],
            de: ["der", "die", "das", "und", "in", "zu", "den", "auf", "mit", "von", "ist", "für", "nicht", "ein", "sich"],
            it: ["il", "la", "i", "le", "e", "in", "di", "che", "per", "con", "non", "un", "una", "si"],
            pt: ["o", "a", "os", "as", "um", "uma", "e", "em", "para", "que", "de", "com", "por", "não", "se"],
            nl: ["de", "het", "een", "en", "in", "van", "te", "dat", "op", "is", "voor", "met", "niet", "zich"]
        };

        const words = text.split(/[\s,.;:!?()'"]+/).slice(0, 1000);
        for (const w of words) {
            if (!w || w.length < 2) continue;
            for (const lang in stopwords) {
                if (stopwords[lang].includes(w)) counters[lang]++;
            }
        }

        let bestLang = null;
        let maxCount = 5;
        for (const lang in counters) {
            if (counters[lang] > maxCount) {
                maxCount = counters[lang];
                bestLang = lang;
            }
        }
        return bestLang;
    }

    async function handleFileSelect(file) {
        try {
            log(window.t('msg_parsing'), 'info');
            elements.dropzone.innerHTML = `
                <div class="dropzone-icon-box"><i class="fa-solid fa-spinner fa-spin"></i></div>
                <h2>${window.t('funny_3')}</h2>
                <p style="color:var(--text-muted); font-weight:500;">${window.t('msg_parsing')}</p>
            `;

            currentBookData = await FileParser.parse(file);
            log(window.t('msg_book_ready', { chapters: currentBookData.chapters.length, words: 0 }), 'success');

            // Auto-détection de la langue
            if (currentBookData.chapters.length > 0) {
                const sampleText = currentBookData.chapters[Math.floor(currentBookData.chapters.length / 2)].text || currentBookData.chapters[0].text;
                const detectedLang = detectLanguageSimple(sampleText);
                if (detectedLang && elements.selectLanguage.value !== detectedLang) {
                    elements.selectLanguage.value = detectedLang;
                    elements.selectLanguage.dispatchEvent(new Event('change')); // Met à jour la liste des voix
                    log(`🌍 Langue détectée automatiquement : ${elements.selectLanguage.options[elements.selectLanguage.selectedIndex].text}`, 'info');
                }
            }

            elements.metaTitle.value = currentBookData.title;
            elements.metaAuthor.value = currentBookData.author;
            
            const totalWords = currentBookData.chapters.reduce((sum, ch) => sum + ch.text.split(/\s+/).length, 0);
            elements.statChapters.textContent = currentBookData.chapters.length;
            elements.statWords.textContent = totalWords.toLocaleString();
            const totalMinutes = Math.round(totalWords / 150);
            elements.statEstTime.textContent = totalMinutes > 60 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}min` : `${totalMinutes} min`;

            if (currentBookData.coverUrl) {
                elements.coverPreview.src = currentBookData.coverUrl;
                elements.coverPreview.classList.remove('hidden');
                elements.coverPlaceholderIcon.classList.add('hidden');
            } else {
                elements.coverPreview.classList.add('hidden');
                elements.coverPlaceholderIcon.classList.remove('hidden');
            }

            elements.chaptersList.innerHTML = '';
            currentBookData.chapters.forEach((ch, idx) => {
                const item = document.createElement('div');
                item.className = 'chapter-row';
                item.id = `chapter-row-${idx}`;
                const wordCount = ch.text.split(/\s+/).length;
                item.innerHTML = `
                    <span><strong>${idx + 1}.</strong> ${ch.title}</span>
                    <span id="chapter-badge-${idx}" class="pill-badge" style="font-size:0.75rem; transition: background-color 0.3s;"><span id="chapter-status-${idx}"><i class="fa-solid fa-clock" style="color:var(--text-muted)"></i></span> &nbsp;${wordCount.toLocaleString()} ${window.t('stat_words')}</span>
                `;
                elements.chaptersList.appendChild(item);
            });

            elements.dropzoneCard.classList.add('hidden');
            elements.bookDetailsCard.classList.remove('hidden');

        } catch (err) {
            log(`Erreur d'analyse : ${err.message}`, 'error');
            alert(`Impossible de lire le fichier : ${err.message}`);
            resetToDropzone();
        }
    }

    function resetToDropzone() {
        currentBookData = null;
        elements.dropzoneCard.classList.remove('hidden');
        elements.bookDetailsCard.classList.add('hidden');
        document.getElementById('actionButtonsRow').classList.remove('hidden');
        elements.progressCard.classList.add('hidden');
        elements.finishedCard.classList.add('hidden');
        
        elements.dropzone.innerHTML = `
            <div class="dropzone-icon-box"><i class="fa-solid fa-cloud-arrow-up"></i></div>
            <h2>Glissez-déposez votre livre ici</h2>
            <p style="color:var(--text-muted); font-weight:500;">Formats acceptés : <strong>EPUB, PDF, DOCX, TXT, MOBI</strong></p>
            <button class="btn-main" id="btnBrowseReload">
                <i class="fa-solid fa-folder-open"></i> Parcourir les fichiers
            </button>
        `;
        document.getElementById('btnBrowseReload')?.addEventListener('click', () => elements.fileInput.click());
    }

    elements.btnReset.addEventListener('click', resetToDropzone);
    elements.btnNewConversion.addEventListener('click', resetToDropzone);

    if (elements.metricsGrid) {
        elements.metricsGrid.addEventListener('click', () => {
            elements.consoleLogs.classList.toggle('hidden');
        });
    }

    elements.btnStartConversion.addEventListener('click', async () => {
        if (!currentBookData || currentBookData.chapters.length === 0) return;

        isConverting = true;
        cancelRequested = false;
        generatedAudioFiles = [];

        document.getElementById('actionButtonsRow').classList.add('hidden');
        elements.progressCard.classList.remove('hidden');

        const totalChapters = currentBookData.chapters.length;
        for(let i=0; i<totalChapters; i++) {
            const row = document.getElementById(`chapter-row-${i}`);
            const stat = document.getElementById(`chapter-status-${i}`);
            const badge = document.getElementById(`chapter-badge-${i}`);
            if(row) row.style.border = '';
            if(stat) stat.innerHTML = `<i class="fa-solid fa-clock" style="color:var(--text-muted)"></i>`;
            if(badge) badge.style.backgroundColor = '';
        }

        const voice = elements.selectVoice.value;
        const rate = parseInt(elements.rangeRate.value);
        const pitch = parseInt(elements.rangePitch.value);

        const safeTitle = elements.metaTitle.value || 'Audiobook';
        log(window.t('msg_start_synth', { title: safeTitle }), 'info');
        log(`💡 ${getRandomFunnyMessage()}`, 'info');

        const totalWordsOverall = currentBookData.chapters.reduce((sum, ch) => sum + ch.text.split(/\s+/).length, 0);
        let processedWordsOverall = 0;
        const startTime = Date.now();

        elements.metricWords.textContent = `0 / ${totalWordsOverall.toLocaleString()}`;

        const maxThreads = parseInt(elements.selectThreads.value) || 5;
        let currentIndex = 0;

        async function tagAudioBlob(blob, title, author, bookTitle, trackNum, coverUrl) {
            if (typeof ID3Writer === 'undefined') return blob;
            try {
                const arrayBuffer = await blob.arrayBuffer();
                const writer = new ID3Writer(arrayBuffer);
                writer.setFrame('TIT2', title)
                      .setFrame('TPE1', [author])
                      .setFrame('TALB', bookTitle)
                      .setFrame('TRCK', trackNum);
                      
                if (coverUrl) {
                    const coverResp = await fetch(coverUrl);
                    const coverBuffer = await coverResp.arrayBuffer();
                    writer.setFrame('APIC', {
                        type: 3, // front cover
                        data: coverBuffer,
                        description: 'Cover',
                        useUnicodeEncoding: false
                    });
                }
                writer.addTag();
                return new Blob([writer.arrayBuffer], { type: 'audio/mp3' });
            } catch(err) {
                console.warn("Erreur d'injection ID3 de la pochette : ", err);
                return blob;
            }
        }

        const workerTask = async () => {
            while (currentIndex < totalChapters) {
                if (cancelRequested) {
                    log(window.t('msg_cancel_req'), 'warning');
                    break;
                }

                const i = currentIndex++;
                const chapter = currentBookData.chapters[i];
                const chapWords = chapter.text.split(/\s+/).length;
                
                const funnyStatus = getRandomFunnyMessage();
                document.getElementById('progressStatusText').textContent = window.t('msg_chap_progress', { i: i + 1, total: totalChapters, funny: funnyStatus });
                
                // Maj UI Chapitre en cours
                const row = document.getElementById(`chapter-row-${i}`);
                const statIcon = document.getElementById(`chapter-status-${i}`);
                if (row) row.style.border = '2px solid var(--accent-blue)';
                if (statIcon) statIcon.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="color:var(--accent-blue)"></i>`;

                try {
                    // MP3 de silence pur généré localement (environ 1.5 sec)
                    const SILENCE_MP3_B64 = "//UQQAAAAAD/+xDEAAPAAAGkAAAAIAAANIAAAARMQU1FMy4xMDEgKGJldGEgMylVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAxIChiZf/7EMQpg8AAAaQAAAAgAAA0gAAABHRhIDMpVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDEgKGJl//sQxFMDwAABpAAAACAAADSAAAAEdGEgMylVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMSAoYmX/+xDEfIPAAAGkAAAAIAAANIAAAAR0YSAzKVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAxIChiZf/7EMSmA8AAAaQAAAAgAAA0gAAABHRhIDMpVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDEgKGJl//sQxM+DwAABpAAAACAAADSAAAAEdGEgMylVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMSAoYmX/+xDE1gPAAAGkAAAAIAAANIAAAAR0YSAzKVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAxIChiZf/7EMTWA8AAAaQAAAAgAAA0gAAABHRhIDMpVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDEgKGJl//sQxNYDwAABpAAAACAAADSAAAAEdGEgMylVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMSAoYmX/+xDE1gPAAAGkAAAAIAAANIAAAAR0YSAzKVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAxIChiZf/7EMTWA8AAAaQAAAAgAAA0gAAABHRhIDMpVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDEgKGJl//sQxNYDwAABpAAAACAAADSAAAAEdGEgMylVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMSAoYmX/+xDE1gPAAAGkAAAAIAAANIAAAAR0YSAzKVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAxIChiZf/7EMTWA8AAAaQAAAAgAAA0gAAABHRhIDMpVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDEgKGJl//sQxNYDwAABpAAAACAAADSAAAAEdGEgMylVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMSAoYmX/+xDE1gPAAAGkAAAAIAAANIAAAAR0YSAzKVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAxIChiZf/7EMTWA8AAAaQAAAAgAAA0gAAABHRhIDMpVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDEgKGJl//sQxNYDwAABpAAAACAAADSAAAAEdGEgMylVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMSAoYmX/+xDE1gPAAAGkAAAAIAAANIAAAAR0YSAzKVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAxIChiZf/7EMTWA8AAAaQAAAAgAAA0gAAABHRhIDMpVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDEgKGJl//sQxNYDwAABpAAAACAAADSAAAAEdGEgMylVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMSAoYmX/+xDE1gPAAAGkAAAAIAAANIAAAAR0YSAzKVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAxIChiZf/7EMTWA8AAAaQAAAAgAAA0gAAABHRhIDMpVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDEgKGJl//sQxNYDwAABpAAAACAAADSAAAAEdGEgMylVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMSAoYmX/+xDE1gPAAAGkAAAAIAAANIAAAAR0YSAzKVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAxIChiZf/7EMTWA8AAAaQAAAAgAAA0gAAABHRhIDMpVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDEgKGJl//sQxNYDwAABpAAAACAAADSAAAAEdGEgMylVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMSAoYmX/+xDE1gPAAAGkAAAAIAAANIAAAAR0YSAzKVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAxIChiZf/7EMTWA8AAAaQAAAAgAAA0gAAABHRhIDMpVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDEgKGJl//sQxNYDwAABpAAAACAAADSAAAAEdGEgMylVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMSAoYmX/+xDE1gPAAAGkAAAAIAAANIAAAAR0YSAzKVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAxIChiZf/7EMTWA8AAAaQAAAAgAAA0gAAABHRhIDMpVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDEgKGJl//sQxNYDwAABpAAAACAAADSAAAAEdGEgMylVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMSAoYmX/+xDE1gPAAAGkAAAAIAAANIAAAAR0YSAzKVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAxIChiZf/7EMTWA8AAAaQAAAAgAAA0gAAABHRhIDMpVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDEgKGJl//sQxNYDwAABpAAAACAAADSAAAAEdGEgMylVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMSAoYmX/+xDE1gPAAAGkAAAAIAAANIAAAAR0YSAzKVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAxIChiZf/7EMTWA8AAAaQAAAAgAAA0gAAABHRhIDMpVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDEgKGJl//sQxNYDwAABpAAAACAAADSAAAAEdGEgMylVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMSAoYmX/+xDE1gPAAAGkAAAAIAAANIAAAAR0YSAzKVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAxIChiZf/7EMTWA8AAAaQAAAAgAAA0gAAABHRhIDMpVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDEgKGJl//sQxNYDwAABpAAAACAAADSAAAAEdGEgMylVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMSAoYmX/+xDE1gPAAAGkAAAAIAAANIAAAAR0YSAzKVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAxIChiZf/7EMTWA8AAAaQAAAAgAAA0gAAABHRhIDMpVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDEgKGJl//sQxNYDwAABpAAAACAAADSAAAAEdGEgMylVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xDE1gPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7EMTWA8AAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQxNYDwAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xDE1gPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7EMTWA8AAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";
                    const silenceBytes = Uint8Array.from(atob(SILENCE_MP3_B64), c => c.charCodeAt(0));
                    const silenceBlob = new Blob([silenceBytes], { type: 'audio/mp3' });
                    
                    let audioBlob = await ttsClient.synthesize(chapter.text, { voice, rate, pitch });
                    
                    // Ajout du silence à la fin
                    audioBlob = new Blob([audioBlob, silenceBlob], { type: 'audio/mp3' });
                    
                    audioBlob = await tagAudioBlob(
                        audioBlob, 
                        chapter.title, 
                        elements.metaAuthor.value || 'Inconnu', 
                        elements.metaTitle.value || 'Audiobook', 
                        `${i + 1}/${totalChapters}`, 
                        currentBookData.coverUrl
                    );

                    const safeTitle = chapter.title.replace(/[^a-zA-Z0-9àáâäãåąčćđéèêëėęėîïǐíìôöòóõøōǒùúûüųűÿýżźñçčšžÀÁÂÄÃÅĄĆČĐÉÈÊËĖĘÎÏÍÌÔÖÒÓÕØŌǑÙÚÛÜŲŰŸÝŻŹÑßÇŒÆ\s-]/g, "").trim();
                    const chapFallback = (window.t && window.t('chapter_default')) ? window.t('chapter_default') : 'Chapitre';
                    const filename = `${(i + 1).toString().padStart(3, '0')}_${safeTitle || chapFallback}.${currentFormat === 'm4b' ? 'm4b' : 'mp3'}`;

                    generatedAudioFiles.push({ filename, title: chapter.title, blob: audioBlob, index: i });
                    processedWordsOverall += chapWords;
                    
                    const elapsedSec = (Date.now() - startTime) / 1000;
                    const speed = Math.round(processedWordsOverall / elapsedSec);
                    const remainingWords = totalWordsOverall - processedWordsOverall;
                    const etaSec = speed > 0 ? Math.round(remainingWords / speed) : 0;

                    const percent = Math.round((processedWordsOverall / totalWordsOverall) * 100);
                    elements.progressBarFill.style.width = `${percent}%`;
                    elements.progressPercentText.textContent = `${percent}%`;
                    
                    elements.metricWords.textContent = `${processedWordsOverall.toLocaleString()} / ${totalWordsOverall.toLocaleString()}`;
                    elements.metricSpeed.textContent = `${speed} ${window.t('metric_speed_val')}`;
                    elements.metricEta.textContent = `${Math.floor(etaSec / 60)}m ${etaSec % 60}s`;

                    // Maj UI Chapitre terminé
                    if (row) row.style.border = '2px solid var(--accent-mint)';
                    if (statIcon) statIcon.innerHTML = `<i class="fa-solid fa-check" style="color:var(--text-main)"></i>`;
                    const badge = document.getElementById(`chapter-badge-${i}`);
                    if (badge) badge.style.backgroundColor = 'var(--accent-mint)';
                    
                    log(window.t('msg_chap_done', { i: i + 1, total: totalChapters, words: chapWords.toLocaleString(), fallback: `✅ Chapitre ${i + 1}/${totalChapters} converti (${chapWords.toLocaleString()} mots)` }), 'success');

                } catch (err) {
                    log(window.t('msg_chap_err', { i: i + 1, err: err.message }), 'error');
                    // Maj UI Chapitre erreur
                    if (row) row.style.border = '2px solid var(--accent-pink)';
                    if (statIcon) statIcon.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color:var(--accent-pink)"></i>`;
                }
            }
        };

        const workers = Array.from({ length: maxThreads }, () => workerTask());
        await Promise.all(workers);

        // Trier le tableau final pour garantir l'ordre chronologique des chapitres
        generatedAudioFiles.sort((a, b) => a.index - b.index);

        isConverting = false;

        if (!cancelRequested && generatedAudioFiles.length > 0) {
            log(window.t('msg_synth_success'), 'success');
            elements.progressCard.classList.add('hidden');
            elements.bookDetailsCard.classList.add('hidden');
            document.getElementById('actionButtonsRow').classList.remove('hidden');
            elements.finishedCard.classList.remove('hidden');

            elements.btnDownloadAudiobook.innerHTML = `<i class="fa-solid fa-file-audio"></i> ${window.t('save_audio_btn')} (<span id="lblDownloadFormat">${currentFormat === 'm4b' ? '.m4b' : '.zip'}</span>)`;
            
            if (currentFormat === 'm4b' && elements.btnDownloadMp3Zip) {
                elements.btnDownloadMp3Zip.classList.remove('hidden');
            } else if (elements.btnDownloadMp3Zip) {
                elements.btnDownloadMp3Zip.classList.add('hidden');
            }
        }
    });

    elements.btnCancelConversion.addEventListener('click', () => {
        if (confirm("Voulez-vous vraiment annuler la conversion ?")) {
            cancelRequested = true;
            resetToDropzone();
        }
    });

    async function generateZipArchive() {
        const zip = new JSZip();
        const folder = zip.folder(elements.metaTitle.value || "Audiobook");
        generatedAudioFiles.forEach(item => {
            const filenameMp3 = item.filename.replace('.m4b', '.mp3');
            folder.file(filenameMp3, item.blob);
        });

        const zipBlob = await zip.generateAsync({ type: "blob" });
        const downloadUrl = URL.createObjectURL(zipBlob);

        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${elements.metaTitle.value || 'Audiobook'}_MP3s.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    elements.btnDownloadAudiobook.addEventListener('click', async () => {
        if (generatedAudioFiles.length === 0) return;

        elements.btnDownloadAudiobook.disabled = true;
        elements.btnDownloadAudiobook.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Emballage du paquet audio... 🎁`;

        try {
            if (currentFormat === 'm4b') {
                const allBlobs = generatedAudioFiles.map(item => item.blob);
                const mergedM4bBlob = new Blob(allBlobs, { type: "audio/m4b" });
                const downloadUrl = URL.createObjectURL(mergedM4bBlob);

                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = `${elements.metaTitle.value || 'Audiobook'}.m4b`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

            } else {
                await generateZipArchive();
            }

        } catch (err) {
            alert(`Erreur d'exportation : ${err.message}`);
        } finally {
            elements.btnDownloadAudiobook.disabled = false;
            elements.btnDownloadAudiobook.innerHTML = `<i class="fa-solid fa-file-audio"></i> ${window.t('save_audio_btn')} (<span id="lblDownloadFormat">${currentFormat === 'm4b' ? '.m4b' : '.zip'}</span>)`;
        }
    });

    if (elements.btnDownloadMp3Zip) {
        elements.btnDownloadMp3Zip.addEventListener('click', async () => {
            if (generatedAudioFiles.length === 0) return;
            elements.btnDownloadMp3Zip.disabled = true;
            elements.btnDownloadMp3Zip.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Emballage...`;
            try {
                await generateZipArchive();
            } catch (err) {
                alert(`Erreur d'exportation : ${err.message}`);
            } finally {
                elements.btnDownloadMp3Zip.disabled = false;
                elements.btnDownloadMp3Zip.innerHTML = `<i class="fa-solid fa-file-zipper"></i> <span data-i18n="save_zip_btn">${window.t('save_zip_btn') || "Télécharger en MP3 (.zip)"}</span>`;
            }
        });
    }

    elements.btnDownloadTranscript.addEventListener('click', () => {
        if (!currentBookData) return;
        let fullTranscript = `=== ${elements.metaTitle.value} ===\nAuteur: ${elements.metaAuthor.value}\n\n`;
        currentBookData.chapters.forEach(ch => {
            const textTrim = ch.text.trim();
            const titleTrim = ch.title.trim();
            if (textTrim.toLowerCase().startsWith(titleTrim.toLowerCase())) {
                fullTranscript += `${textTrim}\n\n`;
            } else {
                fullTranscript += `--- ${titleTrim} ---\n\n${textTrim}\n\n`;
            }
        });

        const blob = new Blob([fullTranscript], { type: "text/plain;charset=utf-8" });
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${elements.metaTitle.value || 'Audiobook'}_Transcript.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
});
