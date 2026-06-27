/**
 * Orchestrateur principal de l'application audiolivreur.ai (Messages Cools & Fun style Discord)
 */

document.addEventListener('DOMContentLoaded', () => {
    const ttsClient = new EdgeTtsClient();
    let currentBookData = null;
    let generatedAudioFiles = [];
    let isConverting = false;
    let cancelRequested = false;
    let currentFormat = 'mp3';

    // Discord-style funny loading messages
    const funnyLoadingMessages = [
        "Chauffage des cordes vocales de l'IA... 🎤",
        "Préparation du café pour la voix neuronale... ☕",
        "Dépoussiérage des vieux parchemins... 📜",
        "Convocation des lutins liseurs d'audiobooks... 🧙‍♂️",
        "Nettoyage des lunettes de lecture... 👓",
        "Vérification que les chats ne marchent pas sur le clavier... 🐾",
        "Vérification des règles de grammaire (on fait de notre mieux !)... 🤓",
        "Conversion des mots en décibels de pur bonheur... 🎧",
        "Hydratation de l'IA avec de l'eau déminéralisée... 💧",
        "Réglage du volume jusqu'à 11... 🔊",
        "Répétition générale avant le grand oral... 🎭",
        "Inspiration profonde... et c'est parti ! 🌬️"
    ];

    function getRandomFunnyMessage() {
        return funnyLoadingMessages[Math.floor(Math.random() * funnyLoadingMessages.length)];
    }

    // DOM Elements
    const elements = {
        toggleMp3: document.getElementById('toggleMp3'),
        toggleM4b: document.getElementById('toggleM4b'),
        formatHint: document.getElementById('formatHint'),
        lblDownloadFormat: document.getElementById('lblDownloadFormat'),

        selectLanguage: document.getElementById('selectLanguage'),
        selectVoice: document.getElementById('selectVoice'),
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
        btnCancelConversion: document.getElementById('btnCancelConversion'),

        finishedCard: document.getElementById('finishedCard'),
        btnDownloadAudiobook: document.getElementById('btnDownloadAudiobook'),
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

    // Toggle MP3 / M4B Format Handler avec textes super funs
    elements.toggleMp3.addEventListener('click', () => {
        currentFormat = 'mp3';
        elements.toggleMp3.classList.add('active');
        elements.toggleM4b.classList.remove('active');
        elements.formatHint.innerHTML = `⚡ <strong>Le Choix des Boss (MP3) :</strong> Rapide comme l'éclair ! Ton PC/Mac/Phone reste au frais et ta batterie te dira merci. 🚀`;
        if (elements.lblDownloadFormat) elements.lblDownloadFormat.textContent = `.zip MP3`;
    });

    elements.toggleM4b.addEventListener('click', () => {
        currentFormat = 'm4b';
        elements.toggleM4b.classList.add('active');
        elements.toggleMp3.classList.remove('active');
        elements.formatHint.innerHTML = `🔥 <strong>Mode M4B Unique (Attention les cuisses !) :</strong> Ton navigateur va faire de la musculation intensive pour tout fusionner. Risque de faire chauffer ton PC ou ton smartphone en mode radiateur d'appoint ! 🏋️‍♂️🔥`;
        if (elements.lblDownloadFormat) elements.lblDownloadFormat.textContent = `.m4b Unique`;
    });

    const sampleTextsByLang = {
        'fr-FR': "Bonjour ! Ceci est un extrait de test de la voix sélectionnée pour votre livre audio.",
        'en-US': "Hello! This is a sample recording to test the selected neural voice for your audiobook.",
        'en-GB': "Hello! This is a sample recording to test the selected neural voice for your audiobook.",
        'es-ES': "¡Hola! Este es un fragmento de prueba para evaluar la voz seleccionada para tu libro hablado.",
        'de-DE': "Hallo! Dies ist eine Hörprobe, um die ausgewählte Stimme für Ihr Hörbuch zu testen.",
        'it-IT': "Ciao! Questo è un campione audio di prova per testare la voce selezionata per il tuo audiolibro."
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
            <p>Cette application a été imaginée et développée par <strong>Julien HOUSSIN</strong> pour rendre la création d'audiobooks accessible à tous, gratuitement et sans contraintes.</p>
            <div style="background:var(--accent-yellow); border:2px solid var(--border-black); padding:1rem; border-radius:10px; margin-top:0.5rem;">
                <p><strong>👤 Créateur :</strong> Julien HOUSSIN</p>
                <p><strong>🌐 Code Source :</strong> Disponible sur <a href="https://github.com/jul1n/AudioLivreur" target="_blank" style="color:var(--text-main); font-weight:700;">GitHub</a></p>
            </div>
        `);
    });

    elements.btnOpenModalCredits.addEventListener('click', () => {
        openModal("✨ Crédits & Open-Source", `
            <p>Imaginé avec ❤️ par <strong>Julien HOUSSIN</strong> et propulsé par la formidable communauté Open-Source :</p>
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
            opt.textContent = `${v.LocalName} (${v.Gender === 'Male' ? 'Homme' : 'Femme'})`;
            elements.selectVoice.appendChild(opt);
        });
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

    elements.btnTestVoice.addEventListener('click', async () => {
        const lang = elements.selectLanguage.value;
        const voice = elements.selectVoice.value;
        const rate = parseInt(elements.rangeRate.value);
        const pitch = parseInt(elements.rangePitch.value);

        elements.btnTestVoice.disabled = true;
        elements.btnTestVoice.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Test vocal...`;

        try {
            const testText = sampleTextsByLang[lang] || sampleTextsByLang['fr-FR'];
            const audioBlob = await ttsClient.synthesize(testText, { voice, rate, pitch });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.play();
        } catch (err) {
            alert(`Erreur lors du test vocal : ${err.message}`);
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

    async function handleFileSelect(file) {
        try {
            log(`Analyse du fichier : ${file.name}...`);
            elements.dropzone.innerHTML = `
                <div class="dropzone-icon-box"><i class="fa-solid fa-spinner fa-spin"></i></div>
                <h2>Dépoussiérage du livre en cours... 📜</h2>
                <p style="color:var(--text-muted); font-weight:500;">On extrait les chapitres à la vitesse de la lumière !</p>
            `;

            currentBookData = await FileParser.parse(file);
            log(`🎉 Livre extrait avec succès ! (${currentBookData.chapters.length} chapitres trouvés)`, 'success');

            elements.metaTitle.value = currentBookData.title;
            elements.metaAuthor.value = currentBookData.author;
            
            const totalWords = currentBookData.chapters.reduce((sum, ch) => sum + ch.text.split(/\s+/).length, 0);
            elements.statChapters.textContent = currentBookData.chapters.length;
            elements.statWords.textContent = totalWords.toLocaleString();
            elements.statEstTime.textContent = Math.round(totalWords / 150);

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
                const wordCount = ch.text.split(/\s+/).length;
                item.innerHTML = `
                    <span><strong>${idx + 1}.</strong> ${ch.title}</span>
                    <span class="pill-badge" style="font-size:0.75rem;">${wordCount.toLocaleString()} mots</span>
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

    elements.btnStartConversion.addEventListener('click', async () => {
        if (!currentBookData || currentBookData.chapters.length === 0) return;

        isConverting = true;
        cancelRequested = false;
        generatedAudioFiles = [];

        elements.bookDetailsCard.classList.add('hidden');
        elements.progressCard.classList.remove('hidden');

        const voice = elements.selectVoice.value;
        const rate = parseInt(elements.rangeRate.value);
        const pitch = parseInt(elements.rangePitch.value);

        log(`🚀 Démarrage de la synthèse vocale pour "${elements.metaTitle.value}"...`, 'info');
        log(`💡 Note Discord : ${getRandomFunnyMessage()}`, 'warning');

        const totalChapters = currentBookData.chapters.length;
        const totalWordsOverall = currentBookData.chapters.reduce((sum, ch) => sum + ch.text.split(/\s+/).length, 0);
        let processedWordsOverall = 0;
        const startTime = Date.now();

        elements.metricWords.textContent = `0 / ${totalWordsOverall.toLocaleString()}`;

        for (let i = 0; i < totalChapters; i++) {
            if (cancelRequested) {
                log("🛑 Synthèse annulée par l'utilisateur.", 'warning');
                break;
            }

            const chapter = currentBookData.chapters[i];
            const chapWords = chapter.text.split(/\s+/).length;
            
            const funnyStatus = getRandomFunnyMessage();
            log(`🎙️ Chapitre ${i + 1}/${totalChapters} : "${chapter.title}" (${chapWords} mots)...`);
            elements.progressStatusText.textContent = `${funnyStatus} (${chapter.title})`;

            try {
                const audioBlob = await ttsClient.synthesize(chapter.text, { voice, rate, pitch });
                const safeTitle = chapter.title.replace(/[^a-zA-Z0-9àáâäãåąčćđéèêëėęėîïǐíìôöòóõøōǒùúûüųűÿýżźñçčšžÀÁÂÄÃÅĄĆČĐÉÈÊËĖĘÎÏÍÌÔÖÒÓÕØŌǑÙÚÛÜŲŰŸÝŻŹÑßÇŒÆ\s-]/g, "").trim();
                const filename = `${(i + 1).toString().padStart(3, '0')}_${safeTitle || 'Chapitre'}.${currentFormat === 'm4b' ? 'm4b' : 'mp3'}`;

                generatedAudioFiles.push({ filename, title: chapter.title, blob: audioBlob });
                processedWordsOverall += chapWords;
                
                const elapsedSec = (Date.now() - startTime) / 1000;
                const speed = Math.round(processedWordsOverall / elapsedSec);
                const remainingWords = totalWordsOverall - processedWordsOverall;
                const etaSec = speed > 0 ? Math.round(remainingWords / speed) : 0;

                const percent = Math.round((processedWordsOverall / totalWordsOverall) * 100);
                elements.progressBarFill.style.width = `${percent}%`;
                elements.progressPercentText.textContent = `${percent}%`;
                
                elements.metricWords.textContent = `${processedWordsOverall.toLocaleString()} / ${totalWordsOverall.toLocaleString()}`;
                elements.metricSpeed.textContent = `${speed} mots/sec`;
                elements.metricEta.textContent = `${Math.floor(etaSec / 60)}m ${etaSec % 60}s`;

                log(`✅ Chapitre ${i + 1} synthétisé avec succès !`, 'success');

            } catch (err) {
                log(`❌ Erreur au chapitre ${i + 1} : ${err.message}`, 'error');
            }
        }

        isConverting = false;

        if (!cancelRequested && generatedAudioFiles.length > 0) {
            log("🎉 Synthèse terminée avec succès ! Préparez vos écouteurs !", 'success');
            elements.progressCard.classList.add('hidden');
            elements.finishedCard.classList.remove('hidden');
        }
    });

    elements.btnCancelConversion.addEventListener('click', () => {
        if (confirm("Voulez-vous vraiment annuler la conversion ?")) {
            cancelRequested = true;
            resetToDropzone();
        }
    });

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
                const zip = new JSZip();
                const folder = zip.folder(elements.metaTitle.value || "Audiobook");
                generatedAudioFiles.forEach(item => folder.file(item.filename, item.blob));

                const zipBlob = await zip.generateAsync({ type: "blob" });
                const downloadUrl = URL.createObjectURL(zipBlob);

                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = `${elements.metaTitle.value || 'Audiobook'}_MP3s.zip`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }

        } catch (err) {
            alert(`Erreur d'exportation : ${err.message}`);
        } finally {
            elements.btnDownloadAudiobook.disabled = false;
            elements.btnDownloadAudiobook.innerHTML = `<i class="fa-solid fa-file-audio"></i> Télécharger les Audiobooks (<span id="lblDownloadFormat">${currentFormat === 'm4b' ? '.m4b Unique' : '.zip MP3'}</span>)`;
        }
    });

    elements.btnDownloadTranscript.addEventListener('click', () => {
        if (!currentBookData) return;
        let fullTranscript = `=== ${elements.metaTitle.value} ===\nAuteur: ${elements.metaAuthor.value}\n\n`;
        currentBookData.chapters.forEach(ch => fullTranscript += `--- ${ch.title} ---\n\n${ch.text}\n\n`);

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
