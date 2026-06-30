document.addEventListener('DOMContentLoaded', () => {
    const isGitHubPages = window.location.hostname.includes('github.io');
    const ttsClient = isGitHubPages ? new WebSpeechTtsClient() : new EdgeTtsClient();
    let currentBookData = null;
    let currentProjectId = null;
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
        selectThreads: document.getElementById(isGitHubPages ? 'selectThreadsWeb' : 'selectThreadsLocal'),
        selectTransition: document.getElementById('selectTransition'),
        btnTestVoice: document.getElementById('btnTestVoice'),
        rangeRate: document.getElementById('rangeRate'),
        valRate: document.getElementById('valRate'),
        rangePitch: document.getElementById('rangePitch'),
        valPitch: document.getElementById('valPitch'),
        btnHistory: document.getElementById('btnHistory'),
        historyModalOverlay: document.getElementById('historyModalOverlay'),
        btnCloseHistoryModal: document.getElementById('btnCloseHistoryModal'),
        historyListContainer: document.getElementById('historyListContainer'),
        btnToggleAdvanced: document.getElementById('btnToggleAdvanced'),
        lblToggleAdvanced: document.getElementById('lblToggleAdvanced'),
        advancedSettingsBlock: document.getElementById('advancedSettingsBlock'),

        dropzoneCard: document.getElementById('dropzoneCard'),
        dropzone: document.getElementById('dropzone'),
        fileInput: document.getElementById('fileInput'),
        btnBrowse: document.getElementById('btnBrowse'),

        bookDetailsCard: document.getElementById('bookDetailsCard'),
        coverPreview: document.getElementById('coverPreview'),
        coverPlaceholderIcon: document.getElementById('coverPlaceholderIcon'),
        btnCropCover: document.getElementById('btnCropCover'),
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

    // Ajustement de l'interface (Web vs Local)
    if (isGitHubPages) {
        if (document.getElementById('demoBanner')) document.getElementById('demoBanner').style.display = 'flex';
        if (document.getElementById('modeWebBox')) document.getElementById('modeWebBox').style.display = 'block';
        if (document.getElementById('modeLocalBox')) document.getElementById('modeLocalBox').style.display = 'none';
        
        // Header Text for Web
        const topBadge = document.getElementById('topDemoBadge');
        if (topBadge) {
            topBadge.innerHTML = '🌐 Démo Web &bull; Voix Système';
        }
    } else {
        if (document.getElementById('demoBanner')) document.getElementById('demoBanner').style.display = 'none';
        if (document.getElementById('modeWebBox')) document.getElementById('modeWebBox').style.display = 'none';
        if (document.getElementById('modeLocalBox')) document.getElementById('modeLocalBox').style.display = 'block';
        
        // Header Text for Local
        const topBadge = document.getElementById('topDemoBadge');
        if (topBadge) {
            topBadge.innerHTML = '🚀 Moteur Local Activé';
            topBadge.removeAttribute('data-i18n'); // prevent i18n from overriding
        }
        
        // Voice label change for Local
        const voiceLabel = document.querySelector('label[data-i18n="voice_local_label"]');
        if (voiceLabel) {
            voiceLabel.innerHTML = '<i class="fa-solid fa-microphone-lines"></i> Voix';
            voiceLabel.removeAttribute('data-i18n'); // prevent i18n from overriding
        }
    }

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

                // Si aucun livre n'est chargé, on synchronise la langue du livre avec l'interface
                if (!currentBookData && elements.selectLanguage) {
                    elements.selectLanguage.value = val;
                    if (typeof updateVoiceSelect === 'function') {
                        updateVoiceSelect();
                    }
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
                // Les statistiques globales (statChapters, statWords, statEstTime) sont déjà traduites
                // par la fonction applyTranslations via leurs attributs data-i18n respectifs.
                // Nous n'avons pas besoin de réinjecter leur HTML ici.
                
                // Update chapter rows
                currentBookData.chapters.forEach((ch, idx) => {
                    const badge = document.getElementById(`chapter-badge-${idx}`);
                    if(badge) {
                        const wordCount = ch.text.split(/\\s+/).length;
                        badge.innerHTML = `<span id="chapter-status-${idx}"><i class="fa-solid fa-clock" style="color:var(--text-muted)"></i></span> &nbsp;${wordCount.toLocaleString('fr-FR')} ${window.t('stat_words')}`;
                    }
                });
            }
        }
        
        let savedLang = localStorage.getItem('audiolivreur_lang');
        if (!savedLang) {
            const browserLang = (navigator.language || navigator.userLanguage || 'fr').split('-')[0].toLowerCase();
            const availableLangs = ['fr', 'en', 'es', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ar'];
            savedLang = availableLangs.includes(browserLang) ? browserLang : 'en';
            localStorage.setItem('audiolivreur_lang', savedLang);
        }
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
        const m4bOpts = document.getElementById('m4bOptionsContainer');
        if (m4bOpts) m4bOpts.style.display = 'none';
    });

    elements.toggleM4b.addEventListener('click', () => {
        currentFormat = 'm4b';
        elements.toggleM4b.classList.add('active');
        elements.toggleMp3.classList.remove('active');
        elements.formatHint.innerHTML = window.t('format_m4b_hint_text') || `🔥 <strong>Mode M4B Unique (Attention les cuisses !) :</strong> Ton navigateur va faire de la musculation intensive pour tout fusionner. Risque de faire chauffer ton PC ou ton smartphone en mode radiateur d'appoint ! 🏋️‍♂️🔥`;
        if (elements.lblDownloadFormat) elements.lblDownloadFormat.textContent = `.m4b Unique`;
        const m4bOpts = document.getElementById('m4bOptionsContainer');
        if (m4bOpts) m4bOpts.style.display = 'block';
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
        openModal(
            window.t('modal_how_title') || "📖 Comment ça marche ?", 
            window.t('modal_how_body') || "<p>Contenu non chargé</p>"
        );
    });

    elements.btnOpenModalLegal.addEventListener('click', () => {
        openModal(
            window.t('modal_legal_title') || "🔒 Zéro Tracas & 100% Privé", 
            window.t('modal_legal_body') || "<p>Contenu non chargé</p>"
        );
    });

    elements.btnOpenModalContact.addEventListener('click', () => {
        openModal(
            window.t('modal_contact_title') || "⚡ Contacter le Créateur", 
            window.t('modal_contact_body') || "<p>Contenu non chargé</p>"
        );
    });

    elements.btnOpenModalCredits.addEventListener('click', () => {
        openModal(
            window.t('modal_credits_title') || "✨ Crédits & Open-Source", 
            window.t('modal_credits_body') || "<p>Contenu non chargé</p>"
        );
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

    if (elements.selectLanguage) {
        elements.selectLanguage.value = savedLang;
    }
    updateVoiceSelect();
    elements.selectLanguage.addEventListener('change', updateVoiceSelect);
    
    // For Web Speech API to reload voices when they become available
    if (isGitHubPages && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = updateVoiceSelect;
    }

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

    if (elements.selectTransition) {
        elements.selectTransition.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val && val.startsWith('chime')) {
                const audio = new Audio(`assets/sounds/${val}.mp3`);
                audio.play().catch(err => console.log("Audio preview failed:", err));
            }
        });
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
                if (voice.startsWith('kokoro_') && status.includes('Connexion')) {
                    elements.btnTestVoice.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Chargement IA (1er lancement lent)...`;
                } else {
                    elements.btnTestVoice.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${status}`;
                }
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
            document.getElementById('coverContainer').style.height = '';
            log(window.t('msg_book_ready', { chapters: currentBookData.chapters.length, words: 0 }), 'success');

            // Auto-détection de la langue
            if (currentBookData.chapters.length > 0) {
                const sampleText = currentBookData.chapters[Math.floor(currentBookData.chapters.length / 2)].text || currentBookData.chapters[0].text;
                const detectedLang = detectLanguageSimple(sampleText);
                if (detectedLang && elements.selectLanguage.value !== detectedLang) {
                    elements.selectLanguage.value = detectedLang;
                    elements.selectLanguage.dispatchEvent(new Event('change')); // Met à jour la liste des voix
                    log(window.t('toast_lang_detected', { lang: elements.selectLanguage.options[elements.selectLanguage.selectedIndex].text }) || `🌍 Langue détectée automatiquement : ${elements.selectLanguage.options[elements.selectLanguage.selectedIndex].text}`, 'info');
                }
            }

            elements.metaTitle.value = currentBookData.title;
            elements.metaAuthor.value = currentBookData.author;
            
            const totalWords = currentBookData.chapters.reduce((sum, ch) => sum + ch.text.split(/\s+/).length, 0);
            elements.statChapters.textContent = currentBookData.chapters.length;
            elements.statWords.textContent = totalWords.toLocaleString('fr-FR');
            const totalMinutes = Math.round(totalWords / 150);
            const minLabel = window.t('stat_time_min') || "min";
            elements.statEstTime.textContent = totalMinutes > 60 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60} ${minLabel}` : `${totalMinutes} ${minLabel}`;

            if (currentBookData.coverUrl) {
                elements.coverPreview.src = currentBookData.coverUrl;
                elements.coverPreview.classList.remove('hidden');
                elements.coverPlaceholderIcon.classList.add('hidden');
                if (elements.btnCropCover) elements.btnCropCover.classList.remove('hidden');
            } else {
                elements.coverPreview.classList.add('hidden');
                elements.coverPlaceholderIcon.classList.remove('hidden');
                if (elements.btnCropCover) elements.btnCropCover.classList.add('hidden');
            }

            elements.chaptersList.innerHTML = '';
            currentBookData.chapters.forEach((ch, idx) => {
                const item = document.createElement('div');
                item.className = 'chapter-row';
                item.id = `chapter-row-${idx}`;
                const wordCount = ch.text.split(/\s+/).length;
                item.innerHTML = `
                    <span><strong>${idx + 1}.</strong> ${ch.title}</span>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span id="chapter-play-${idx}" style="display:none; align-items:center; gap:6px; cursor:pointer;" title="${window.t('play_chapter_title')}">
                            <span id="chapter-play-icon-${idx}"><i class="fa-solid fa-circle-play fa-xl" style="color:var(--accent-mint)"></i></span>
                            <span id="chapter-play-time-${idx}" style="font-size:0.75rem; color:var(--text-muted); font-family:monospace; display:none;"></span>
                        </span>
                        <span id="chapter-badge-${idx}" class="pill-badge" style="font-size:0.75rem; transition: background-color 0.3s;"><span id="chapter-status-${idx}"><i class="fa-solid fa-clock" style="color:var(--text-muted)"></i></span> &nbsp;${wordCount.toLocaleString('fr-FR')} ${window.t('stat_words')}</span>
                    </div>
                `;
                elements.chaptersList.appendChild(item);
            });

            currentProjectId = 'proj_' + Date.now();
            saveProjectToServer();

            // Expand advanced settings automatically on book load
            if (elements.advancedSettingsBlock && elements.advancedSettingsBlock.classList.contains('hidden')) {
                elements.advancedSettingsBlock.classList.remove('hidden');
                if (elements.lblToggleAdvanced) {
                    elements.lblToggleAdvanced.setAttribute('data-i18n', 'adv_settings_hide');
                    elements.lblToggleAdvanced.textContent = window.t('adv_settings_hide');
                }
            }

            elements.dropzoneCard.classList.add('hidden');
            elements.bookDetailsCard.classList.remove('hidden');

        } catch (err) {
            log(window.t('toast_parse_err', { err: err.message }) || `Erreur d'analyse : ${err.message}`, 'error');
            alert(window.t('toast_file_err', { err: err.message }) || `Impossible de lire le fichier : ${err.message}`);
            resetToDropzone();
        }
    }

    function resetToDropzone() {
        currentBookData = null;
        currentProjectId = null;
        
        // Collapse advanced settings on reset
        if (elements.advancedSettingsBlock && !elements.advancedSettingsBlock.classList.contains('hidden')) {
            elements.advancedSettingsBlock.classList.add('hidden');
            if (elements.lblToggleAdvanced) {
                elements.lblToggleAdvanced.setAttribute('data-i18n', 'adv_settings_show');
                elements.lblToggleAdvanced.textContent = window.t('adv_settings_show');
            }
        }
        
        if (elements.fileInput) {
            elements.fileInput.value = ''; // Reset the input so the same file can trigger 'change'
        }
        elements.dropzoneCard.classList.remove('hidden');
        elements.bookDetailsCard.classList.add('hidden');
        document.getElementById('actionButtonsRow').classList.remove('hidden');
        elements.progressCard.classList.add('hidden');
        elements.finishedCard.classList.add('hidden');
        
        elements.dropzone.innerHTML = `
            <div class="dropzone-icon-box"><i class="fa-solid fa-cloud-arrow-up"></i></div>
            <h2 data-i18n="dz_title">${window.t('dz_title') || "Glissez-déposez votre livre ici"}</h2>
            <p style="color:var(--text-muted); font-weight:500;" data-i18n="dz_formats">${window.t('dz_formats') || "Formats acceptés : <strong>EPUB, PDF, DOCX, TXT, MOBI</strong>"}</p>
            <button class="btn-main" id="btnBrowseReload" data-i18n="dz_browse_btn">
                ${window.t('dz_browse_btn') || "<i class=\"fa-solid fa-folder-open\"></i> Parcourir les fichiers"}
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

        elements.metricWords.textContent = `0 / ${totalWordsOverall.toLocaleString('fr-FR')}`;

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
                let statusMsg = window.t('msg_chap_progress', { i: i + 1, total: totalChapters, funny: funnyStatus });
                if (voice.startsWith('kokoro_') && i === 0) {
                    statusMsg += " ⏳ (Initialisation IA Kokoro... Cela peut prendre plusieurs minutes au 1er lancement)";
                }
                document.getElementById('progressStatusText').textContent = statusMsg;
                
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
                    
                    const transitionType = document.getElementById('selectTransition').value;
                    if (transitionType === 'silence') {
                        audioBlob = new Blob([audioBlob, silenceBlob], { type: 'audio/mp3' });
                    } else if (transitionType.startsWith('chime')) {
                        try {
                            const res = await fetch(`assets/sounds/${transitionType}.mp3`);
                            if (res.ok) {
                                const chimeBuf = await res.arrayBuffer();
                                const chimeBlob = new Blob([chimeBuf], { type: 'audio/mp3' });
                                // On ajoute 1.5s de silence AVANT la clochette
                                audioBlob = new Blob([audioBlob, silenceBlob, chimeBlob], { type: 'audio/mp3' });
                            }
                        } catch (e) {
                            console.error("Failed to load chime", e);
                        }
                    }
                    
                    const rawAudioBlob = audioBlob;
                    
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

                    generatedAudioFiles.push({ filename, title: chapter.title, blob: audioBlob, rawBlob: rawAudioBlob, index: i });
                    saveProjectToServer();
                    processedWordsOverall += chapWords;
                    
                    const elapsedSec = (Date.now() - startTime) / 1000;
                    const speed = Math.round(processedWordsOverall / elapsedSec);
                    const remainingWords = totalWordsOverall - processedWordsOverall;
                    const etaSec = speed > 0 ? Math.round(remainingWords / speed) : 0;

                    const percent = Math.round((processedWordsOverall / totalWordsOverall) * 100);
                    elements.progressBarFill.style.width = `${percent}%`;
                    elements.progressPercentText.textContent = `${percent}%`;
                    
                    elements.metricWords.textContent = `${processedWordsOverall.toLocaleString('fr-FR')} / ${totalWordsOverall.toLocaleString('fr-FR')}`;
                    elements.metricSpeed.textContent = `${speed.toLocaleString('fr-FR')} ${window.t('metric_speed_val')}`;
                    
                    let etaText = '';
                    if (etaSec >= 3600) {
                        const hours = Math.floor(etaSec / 3600);
                        const mins = Math.floor((etaSec % 3600) / 60);
                        const secs = etaSec % 60;
                        etaText = `${hours}h ${mins}m ${secs}s`;
                    } else {
                        etaText = `${Math.floor(etaSec / 60)}m ${etaSec % 60}s`;
                    }
                    elements.metricEta.textContent = etaText;

                    // Maj UI Chapitre terminé
                    if (row) row.style.border = '2px solid var(--accent-mint)';
                    if (statIcon) statIcon.innerHTML = `<i class="fa-solid fa-check" style="color:var(--text-main)"></i>`;
                    const badge = document.getElementById(`chapter-badge-${i}`);
                    if (badge) badge.style.backgroundColor = 'var(--accent-mint)';
                    
                    bindPlayButton(i, audioBlob);
                    
                    log(window.t('msg_chap_done', { i: i + 1, total: totalChapters, words: chapWords.toLocaleString('fr-FR'), fallback: `✅ Chapitre ${i + 1}/${totalChapters} converti (${chapWords.toLocaleString('fr-FR')} mots)` }), 'success');

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
                const author = elements.metaAuthor.value || window.t('unknown_author') || 'Auteur inconnu';
                const title = elements.metaTitle.value || window.t('unknown_title') || 'Audiobook';
                
                let useServerMerge = false;
                try {
                    const res = await fetch('http://localhost:8000/api/ping', { method: 'GET' }).catch(() => null);
                    if (res && res.ok) useServerMerge = true;
                } catch(e) {}

                let downloadUrl = null;

                if (useServerMerge) {
                    elements.btnDownloadAudiobook.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Création M4B Studio (FFmpeg)... 🎁`;
                    const formData = new FormData();
                    formData.append('title', title);
                    formData.append('author', author);
                    const codecVal = document.querySelector('input[name="m4bMergeCodec"]:checked')?.value || 'aac';
                    formData.append('codec', codecVal);
                    
                    log("🎁 Envoi des chapitres au serveur pour fusion M4B (FFmpeg)...", 'info');
                    if (codecVal === 'aac') {
                        log("⚙️ Encodage parallèle en AAC activé. Le serveur convertit vos chapitres à toute vitesse...", 'info');
                    } else {
                        log("⚡ Copie ultra-rapide sans ré-encodage activée...", 'info');
                    }
                    
                    if (currentBookData.coverUrl) {
                        const coverResp = await fetch(currentBookData.coverUrl);
                        const coverBlob = await coverResp.blob();
                        formData.append('cover', coverBlob, 'cover.jpg');
                    }
                    generatedAudioFiles.forEach((item, i) => {
                        formData.append('chapters', item.rawBlob || item.blob, `chap_${i}.mp3`);
                        formData.append('chapter_titles', item.title || `Chapitre ${i+1}`);
                    });

                    const mergeRes = await fetch('http://localhost:8000/api/merge_m4b', {
                        method: 'POST',
                        body: formData
                    });
                    if (!mergeRes.ok) {
                        log("❌ Erreur de fusion M4B sur le serveur.", 'error');
                        throw new Error("Erreur du serveur lors de la fusion M4B");
                    }
                    const m4bBlob = await mergeRes.blob();
                    downloadUrl = URL.createObjectURL(m4bBlob);
                    log("✅ Livre M4B généré avec succès ! Le téléchargement démarre.", 'success');
                } else {
                    // Fallback Web : Tag ID3 Global + Raw MP3s
                    let globalId3Buffer = new ArrayBuffer(0);
                    if (typeof ID3Writer !== 'undefined') {
                        try {
                            const writer = new ID3Writer(new ArrayBuffer(0));
                            writer.setFrame('TIT2', title)
                                  .setFrame('TPE1', [author])
                                  .setFrame('TALB', title);
                            if (currentBookData.coverUrl) {
                                const coverResp = await fetch(currentBookData.coverUrl);
                                const coverBuffer = await coverResp.arrayBuffer();
                                writer.setFrame('APIC', {
                                    type: 3,
                                    data: coverBuffer,
                                    description: 'Cover',
                                    useUnicodeEncoding: false
                                });
                            }
                            writer.addTag();
                            globalId3Buffer = writer.arrayBuffer;
                        } catch(e) {
                            console.warn("Global ID3 tag failed", e);
                        }
                    }
                    
                    const id3Blob = new Blob([globalId3Buffer], { type: "audio/mp3" });
                    const allRawBlobs = generatedAudioFiles.map(item => item.rawBlob || item.blob);
                    const mergedM4bBlob = new Blob([id3Blob, ...allRawBlobs], { type: "audio/m4b" });
                    downloadUrl = URL.createObjectURL(mergedM4bBlob);
                }

                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = `${author} - ${title}.m4b`;
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
            elements.btnDownloadAudiobook.innerHTML = `<i class="fa-solid fa-file-audio"></i> <span data-i18n="save_audio_btn">${window.t ? window.t('save_audio_btn') : "Sauvegarder l'Audiobook"}</span> (<span id="lblDownloadFormat">${currentFormat === 'm4b' ? '.m4b' : '.zip'}</span>)`;
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

    // Cropper Logic
    let cropperInstance = null;
    const cropperModal = document.getElementById('cropperModal');
    const cropperImage = document.getElementById('cropperImage');
    const btnCancelCrop = document.getElementById('btnCancelCrop');
    const btnApplyCrop = document.getElementById('btnApplyCrop');

    if (elements.btnCropCover && typeof Cropper !== 'undefined') {
        elements.btnCropCover.addEventListener('click', () => {
            if (!currentBookData || !currentBookData.coverUrl) return;
            cropperImage.src = currentBookData.coverUrl;
            cropperModal.classList.remove('hidden');
            
            if (cropperInstance) cropperInstance.destroy();
            cropperInstance = new Cropper(cropperImage, {
                aspectRatio: 1,
                viewMode: 1,
                autoCropArea: 1,
                background: false
            });
        });
    }
    if (elements.coverPreview) {
        elements.coverPreview.addEventListener('error', () => {
            elements.coverPreview.classList.add('hidden');
            elements.coverPlaceholderIcon.classList.remove('hidden');
            if (elements.btnCropCover) elements.btnCropCover.classList.add('hidden');
        });
    }

    if (btnCancelCrop) {
        btnCancelCrop.addEventListener('click', () => {
            cropperModal.classList.add('hidden');
            if (cropperInstance) {
                cropperInstance.destroy();
                cropperInstance = null;
            }
        });
    }

    if (btnApplyCrop) {
        btnApplyCrop.addEventListener('click', () => {
            if (!cropperInstance) return;
            const canvas = cropperInstance.getCroppedCanvas({
                width: 800,
                height: 800
            });
            const newCoverUrl = canvas.toDataURL('image/jpeg', 0.9);
            currentBookData.coverUrl = newCoverUrl;
            elements.coverPreview.src = newCoverUrl;
            document.getElementById('coverContainer').style.height = '140px';
            
            cropperModal.classList.add('hidden');
            cropperInstance.destroy();
            cropperInstance = null;
        });
    }

    function bindPlayButton(idx, blob) {
        const playBtn = document.getElementById(`chapter-play-${idx}`);
        if (!playBtn) return;
        
        playBtn.style.display = 'inline-flex';
        playBtn.onclick = () => {
            const timeSpan = document.getElementById(`chapter-play-time-${idx}`);
            const playIcon = document.getElementById(`chapter-play-icon-${idx}`);
            const formatTime = (secs) => {
                if (isNaN(secs) || secs === Infinity) return '00:00';
                const mins = Math.floor(secs / 60);
                const s = Math.floor(secs % 60);
                return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            };
            
            if (window.currentPlayingAudio) {
                window.currentPlayingAudio.pause();
                if (window.currentPlayingAudioBtn) {
                    const prevIdx = window.currentPlayingIndex;
                    const prevIcon = document.getElementById(`chapter-play-icon-${prevIdx}`);
                    const prevTime = document.getElementById(`chapter-play-time-${prevIdx}`);
                    if (prevIcon) prevIcon.innerHTML = '<i class="fa-solid fa-circle-play fa-xl" style="color:var(--accent-mint)"></i>';
                    if (prevTime) {
                        prevTime.style.display = 'none';
                        prevTime.textContent = '';
                    }
                }
                if (window.currentPlayingIndex === idx) {
                    window.currentPlayingAudio = null;
                    window.currentPlayingIndex = null;
                    return;
                }
            }
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            audio.play();
            window.currentPlayingAudio = audio;
            window.currentPlayingIndex = idx;
            window.currentPlayingAudioBtn = playBtn;
            
            if (playIcon) playIcon.innerHTML = '<i class="fa-solid fa-circle-pause fa-xl" style="color:var(--accent-mint)"></i>';
            if (timeSpan) {
                timeSpan.style.display = 'inline';
                timeSpan.textContent = '00:00 / --:--';
            }
            
            audio.ontimeupdate = () => {
                if (timeSpan) {
                    timeSpan.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
                }
            };
            audio.onloadedmetadata = () => {
                if (timeSpan) {
                    timeSpan.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
                }
            };
            audio.onended = () => {
                if (playIcon) playIcon.innerHTML = '<i class="fa-solid fa-circle-play fa-xl" style="color:var(--accent-mint)"></i>';
                if (timeSpan) {
                    timeSpan.style.display = 'none';
                    timeSpan.textContent = '';
                }
                window.currentPlayingAudio = null;
                window.currentPlayingIndex = null;
            };
        };
    }

    async function saveProjectToServer() {
        if (!currentBookData || !currentProjectId || isGitHubPages) return;
        
        let coverBase64 = "";
        if (elements.coverPreview && !elements.coverPreview.classList.contains('hidden')) {
            coverBase64 = elements.coverPreview.src;
        }
        
        const projectData = {
            id: currentProjectId,
            title: elements.metaTitle.value || currentBookData.title || "Livre sans titre",
            author: elements.metaAuthor.value || currentBookData.author || "Auteur inconnu",
            cover: coverBase64.startsWith("data:") ? coverBase64 : "",
            settings: {
                voice: elements.selectVoice.value,
                rate: parseInt(elements.rangeRate.value),
                pitch: parseInt(elements.rangePitch.value),
                threads: parseInt(document.getElementById('selectSpeed').value),
                transition: elements.selectTransition.value
            },
            chapters: currentBookData.chapters.map(ch => ({ title: ch.title, text: ch.text })),
            generatedChapters: generatedAudioFiles.map(item => item.index)
        };
        
        try {
            await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectData)
            });
        } catch (e) {
            console.error("Failed to save project on server", e);
        }
    }

    async function loadProjectsList() {
        if (isGitHubPages) return;
        try {
            const res = await fetch('/api/projects');
            const projects = await res.json();
            
            elements.historyListContainer.innerHTML = '';
            if (projects.length === 0) {
                elements.historyListContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 2rem;" data-i18n="history_empty">${window.t('history_empty')}</div>`;
                return;
            }
            
            projects.forEach(p => {
                const row = document.createElement('div');
                row.className = 'chapter-row';
                row.style.display = 'flex';
                row.style.alignItems = 'center';
                row.style.justifyContent = 'space-between';
                row.style.gap = '1rem';
                row.style.padding = '0.8rem';
                
                const hasCover = p.cover && p.cover.startsWith("data:");
                const coverImg = hasCover ? `<img src="${p.cover}" style="width: 50px; height: 75px; object-fit: cover; border: 2px solid var(--border-black); border-radius: 4px;" />` : `<div style="width: 50px; height: 75px; background: var(--bg-card); border: 2px solid var(--border-black); border-radius: 4px; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-book fa-lg" style="color: var(--text-muted);"></i></div>`;
                
                const pct = p.totalChapters > 0 ? Math.round((p.generatedChapters.length / p.totalChapters) * 100) : 0;
                
                row.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 1rem; flex: 1; min-width: 0;">
                        ${coverImg}
                        <div style="min-width: 0;">
                            <strong style="display: block; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${p.title}</strong>
                            <span style="display: block; font-size: 0.8rem; color: var(--text-muted); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${p.author}</span>
                            <span style="font-size: 0.75rem; font-weight: bold; color: var(--accent-purple); display: block; margin-top: 4px;">
                                ${window.t('progress_label')} : ${p.generatedChapters.length}/${p.totalChapters} (${pct}%)
                            </span>
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button class="pill-btn green btn-load-proj" data-id="${p.id}" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">
                            <i class="fa-solid fa-folder-open"></i> ${window.t('history_load')}
                        </button>
                        <button class="pill-btn red btn-delete-proj" data-id="${p.id}" style="padding: 0.4rem 0.6rem; font-size: 0.8rem;">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                `;
                elements.historyListContainer.appendChild(row);
            });
            
            // Add click listeners
            elements.historyListContainer.querySelectorAll('.btn-load-proj').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = btn.getAttribute('data-id');
                    await loadProject(id);
                });
            });
            
            elements.historyListContainer.querySelectorAll('.btn-delete-proj').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = btn.getAttribute('data-id');
                    if (confirm(window.t('history_delete_confirm'))) {
                        await deleteProject(id);
                        await loadProjectsList();
                    }
                });
            });
            
        } catch (e) {
            console.error("Failed to load projects list", e);
        }
    }

    async function deleteProject(id) {
        try {
            await fetch(`/api/projects/${id}`, { method: 'DELETE' });
        } catch (e) {
            console.error("Failed to delete project", e);
        }
    }

    async function loadProject(id) {
        try {
            const res = await fetch(`/api/projects/${id}`);
            if (!res.ok) throw new Error("Failed to fetch project");
            const data = await res.json();
            
            currentProjectId = data.id;
            currentBookData = {
                title: data.title,
                author: data.author,
                chapters: data.chapters,
                coverUrl: data.cover || null
            };
            
            // Restore settings
            if (data.settings) {
                elements.selectVoice.value = data.settings.voice || "";
                elements.rangeRate.value = data.settings.rate || 0;
                elements.valRate.textContent = `${data.settings.rate >= 0 ? '+' : ''}${data.settings.rate}%`;
                elements.rangePitch.value = data.settings.pitch || 0;
                elements.valPitch.textContent = `${data.settings.pitch >= 0 ? '+' : ''}${data.settings.pitch}Hz`;
                document.getElementById('selectSpeed').value = data.settings.threads || 10;
                elements.selectTransition.value = data.settings.transition || "chime3";
                
                const matchedLang = data.settings.voice.startsWith("kokoro_") ? "fr" : (data.settings.voice.startsWith("piper_") ? "fr" : data.settings.voice.split('-').slice(0, 2).join('-'));
                elements.selectLanguage.value = matchedLang.split('-')[0];
                elements.selectLanguage.dispatchEvent(new Event('change'));
                elements.selectVoice.value = data.settings.voice;
            }
            
            // Populate meta details card
            elements.metaTitle.value = currentBookData.title;
            elements.metaAuthor.value = currentBookData.author;
            
            const totalWords = currentBookData.chapters.reduce((sum, ch) => sum + ch.text.split(/\s+/).length, 0);
            elements.statChapters.textContent = currentBookData.chapters.length;
            elements.statWords.textContent = totalWords.toLocaleString('fr-FR');
            const totalMinutes = Math.round(totalWords / 150);
            const minLabel = window.t('stat_time_min') || "min";
            elements.statEstTime.textContent = totalMinutes > 60 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60} ${minLabel}` : `${totalMinutes} ${minLabel}`;
            
            if (currentBookData.coverUrl) {
                elements.coverPreview.src = currentBookData.coverUrl;
                elements.coverPreview.classList.remove('hidden');
                elements.coverPlaceholderIcon.classList.add('hidden');
                if (elements.btnCropCover) elements.btnCropCover.classList.remove('hidden');
            } else {
                elements.coverPreview.classList.add('hidden');
                elements.coverPlaceholderIcon.classList.remove('hidden');
                if (elements.btnCropCover) elements.btnCropCover.classList.add('hidden');
            }
            
            // Build chapters list UI and restore completed chapters
            elements.chaptersList.innerHTML = '';
            generatedAudioFiles = [];
            
            const generatedSet = new Set(data.generatedChapters || []);
            
            currentBookData.chapters.forEach((ch, idx) => {
                const item = document.createElement('div');
                item.className = 'chapter-row';
                item.id = `chapter-row-${idx}`;
                const wordCount = ch.text.split(/\s+/).length;
                const isGenerated = generatedSet.has(idx);
                
                item.innerHTML = `
                    <span><strong>${idx + 1}.</strong> ${ch.title}</span>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span id="chapter-play-${idx}" style="${isGenerated ? 'display:inline-flex;' : 'display:none;'} align-items:center; gap:6px; cursor:pointer;" title="${window.t('play_chapter_title')}">
                            <span id="chapter-play-icon-${idx}"><i class="fa-solid fa-circle-play fa-xl" style="color:var(--accent-mint)"></i></span>
                            <span id="chapter-play-time-${idx}" style="font-size:0.75rem; color:var(--text-muted); font-family:monospace; display:none;"></span>
                        </span>
                        <span id="chapter-badge-${idx}" class="pill-badge" style="font-size:0.75rem; transition: background-color 0.3s; ${isGenerated ? 'background-color: var(--accent-mint);' : ''}">
                            <span id="chapter-status-${idx}">
                                ${isGenerated ? '<i class="fa-solid fa-circle-check" style="color:var(--text-main)"></i>' : '<i class="fa-solid fa-clock" style="color:var(--text-muted)"></i>'}
                            </span> 
                            &nbsp;${wordCount.toLocaleString('fr-FR')} ${window.t('stat_words')}
                        </span>
                    </div>
                `;
                elements.chaptersList.appendChild(item);
                
                if (isGenerated) {
                    // Fetch completed chapter blob in background
                    (async () => {
                        try {
                            const filename = `chap_${idx}.mp3`;
                            const payload = {
                                text: ch.text,
                                voice: elements.selectVoice.value,
                                rate: parseInt(elements.rangeRate.value),
                                pitch: parseInt(elements.rangePitch.value)
                            };
                            const response = await fetch('/api/tts', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(payload)
                            });
                            if (response.ok) {
                                const audioBlob = await response.blob();
                                generatedAudioFiles.push({
                                    filename: filename,
                                    title: ch.title,
                                    blob: audioBlob,
                                    rawBlob: audioBlob,
                                    index: idx
                                });
                                bindPlayButton(idx, audioBlob);
                            }
                        } catch (err) {
                            console.error(`Failed to pre-fetch chapter ${idx} audio:`, err);
                        }
                    })();
                }
            });
            
            // Switch views
            elements.dropzoneCard.classList.add('hidden');
            elements.bookDetailsCard.classList.remove('hidden');
            elements.historyModalOverlay.classList.add('hidden');
            
        } catch (e) {
            console.error("Failed to load project", e);
            alert("Erreur lors du chargement du projet.");
        }
    }

    if (elements.btnHistory) {
        elements.btnHistory.addEventListener('click', () => {
            elements.historyModalOverlay.classList.remove('hidden');
            loadProjectsList();
        });
    }
    
    if (elements.btnCloseHistoryModal) {
        elements.btnCloseHistoryModal.addEventListener('click', () => {
            elements.historyModalOverlay.classList.add('hidden');
        });
    }
    
    if (elements.historyModalOverlay) {
        elements.historyModalOverlay.addEventListener('click', (e) => {
            if (e.target === elements.historyModalOverlay) {
                elements.historyModalOverlay.classList.add('hidden');
            }
        });
    }

    if (elements.btnToggleAdvanced) {
        elements.btnToggleAdvanced.addEventListener('click', () => {
            if (!elements.advancedSettingsBlock) return;
            const isHidden = elements.advancedSettingsBlock.classList.contains('hidden');
            if (isHidden) {
                elements.advancedSettingsBlock.classList.remove('hidden');
                if (elements.lblToggleAdvanced) {
                    elements.lblToggleAdvanced.setAttribute('data-i18n', 'adv_settings_hide');
                    elements.lblToggleAdvanced.textContent = window.t('adv_settings_hide');
                }
            } else {
                elements.advancedSettingsBlock.classList.add('hidden');
                if (elements.lblToggleAdvanced) {
                    elements.lblToggleAdvanced.setAttribute('data-i18n', 'adv_settings_show');
                    elements.lblToggleAdvanced.textContent = window.t('adv_settings_show');
                }
            }
        });
    }

    // Also auto-expand advanced settings when a project is loaded from history
    const originalLoadProject = loadProject;
    loadProject = async function(id) {
        await originalLoadProject(id);
        if (elements.advancedSettingsBlock && elements.advancedSettingsBlock.classList.contains('hidden')) {
            elements.advancedSettingsBlock.classList.remove('hidden');
            if (elements.lblToggleAdvanced) {
                elements.lblToggleAdvanced.setAttribute('data-i18n', 'adv_settings_hide');
                elements.lblToggleAdvanced.textContent = window.t('adv_settings_hide');
            }
        }
    };

});
