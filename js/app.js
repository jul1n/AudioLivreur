/**
 * Orchestrateur principal de l'application AudioLivreur Web
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialisation des composants
    const ttsClient = new EdgeTtsClient();
    let currentBookData = null; // Store loaded book details & chapters
    let generatedAudioFiles = []; // Store blobs of generated MP3s
    let isConverting = false;
    let isPaused = false;
    let cancelRequested = false;

    // DOM Elements
    const elements = {
        // Dropzone & Step 1
        dropzoneCard: document.getElementById('dropzoneCard'),
        dropzone: document.getElementById('dropzone'),
        fileInput: document.getElementById('fileInput'),
        btnBrowse: document.getElementById('btnBrowse'),

        // Step 2: Details
        bookDetailsCard: document.getElementById('bookDetailsCard'),
        coverPreview: document.getElementById('coverPreview'),
        coverPlaceholder: document.getElementById('coverPlaceholder'),
        metaTitle: document.getElementById('metaTitle'),
        metaAuthor: document.getElementById('metaAuthor'),
        statChapters: document.getElementById('statChapters'),
        statWords: document.getElementById('statWords'),
        statEstTime: document.getElementById('statEstTime'),
        chaptersList: document.getElementById('chaptersList'),
        btnStartConversion: document.getElementById('btnStartConversion'),
        btnReset: document.getElementById('btnReset'),

        // Voice Controls
        selectLanguage: document.getElementById('selectLanguage'),
        selectVoice: document.getElementById('selectVoice'),
        btnTestVoice: document.getElementById('btnTestVoice'),
        rangeRate: document.getElementById('rangeRate'),
        valRate: document.getElementById('valRate'),
        rangePitch: document.getElementById('rangePitch'),
        valPitch: document.getElementById('valPitch'),
        rangeParallel: document.getElementById('rangeParallel'),
        valParallel: document.getElementById('valParallel'),
        chkKeepMp3: document.getElementById('chkKeepMp3'),
        chkEmbedTranscript: document.getElementById('chkEmbedTranscript'),

        // Step 3: Progress Dashboard
        progressCard: document.getElementById('progressCard'),
        progressStatusText: document.getElementById('progressStatusText'),
        progressPercentText: document.getElementById('progressPercentText'),
        progressBarFill: document.getElementById('progressBarFill'),
        metricWords: document.getElementById('metricWords'),
        metricSpeed: document.getElementById('metricSpeed'),
        metricEta: document.getElementById('metricEta'),
        consoleLogs: document.getElementById('consoleLogs'),
        btnClearLogs: document.getElementById('btnClearLogs'),
        btnPauseConversion: document.getElementById('btnPauseConversion'),
        btnCancelConversion: document.getElementById('btnCancelConversion'),

        // Step 4: Finished
        finishedCard: document.getElementById('finishedCard'),
        btnDownloadAudiobook: document.getElementById('btnDownloadAudiobook'),
        btnDownloadTranscript: document.getElementById('btnDownloadTranscript'),
        btnNewConversion: document.getElementById('btnNewConversion')
    };

    // Initialize Voice List based on selected language
    function updateVoiceList() {
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

    updateVoiceList();
    elements.selectLanguage.addEventListener('change', updateVoiceList);

    // Sync Range Sliders Display
    elements.rangeRate.addEventListener('input', (e) => {
        elements.valRate.textContent = `${e.target.value >= 0 ? '+' : ''}${e.target.value}%`;
    });
    elements.rangePitch.addEventListener('input', (e) => {
        elements.valPitch.textContent = `${e.target.value >= 0 ? '+' : ''}${e.target.value}Hz`;
    });
    elements.rangeParallel.addEventListener('input', (e) => {
        elements.valParallel.textContent = e.target.value;
    });

    // Logging Utility
    function log(msg, type = 'info') {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        const timeStr = new Date().toLocaleTimeString();
        entry.textContent = `[${timeStr}] ${msg}`;
        elements.consoleLogs.appendChild(entry);
        elements.consoleLogs.scrollTop = elements.consoleLogs.scrollHeight;
    }

    elements.btnClearLogs.addEventListener('click', () => {
        elements.consoleLogs.innerHTML = '';
    });

    // Test Voice Audio Sample
    elements.btnTestVoice.addEventListener('click', async () => {
        const voice = elements.selectVoice.value;
        const rate = parseInt(elements.rangeRate.value);
        const pitch = parseInt(elements.rangePitch.value);
        
        elements.btnTestVoice.disabled = true;
        elements.btnTestVoice.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Génération...`;

        try {
            const testText = "Bonjour ! Ceci est un extrait de test de la voix sélectionnée pour votre livre audio.";
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

    // File Dropzone Event Listeners
    elements.btnBrowse.addEventListener('click', () => elements.fileInput.click());
    
    elements.fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        elements.dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            elements.dropzone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        elements.dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            elements.dropzone.classList.remove('dragover');
        }, false);
    });

    elements.dropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });

    // Handle File Processing
    async function handleFileSelect(file) {
        try {
            log(`Analyse du fichier : ${file.name}...`);
            elements.dropzone.innerHTML = `
                <div class="dropzone-icon"><i class="fa-solid fa-spinner fa-spin"></i></div>
                <h2>Analyse et extraction du livre...</h2>
                <p>Veuillez patienter pendant la lecture de la structure.</p>
            `;

            currentBookData = await FileParser.parse(file);
            log(`Livre extrait avec succès ! (${currentBookData.chapters.length} chapitres trouvés)`, 'success');

            // Populate Book Details View
            elements.metaTitle.value = currentBookData.title;
            elements.metaAuthor.value = currentBookData.author;
            
            const totalWords = currentBookData.chapters.reduce((sum, ch) => sum + ch.text.split(/\s+/).length, 0);
            elements.statChapters.textContent = currentBookData.chapters.length;
            elements.statWords.textContent = totalWords.toLocaleString();
            // Estimate audio duration (approx 150 words per min)
            elements.statEstTime.textContent = Math.round(totalWords / 150);

            // Cover Preview
            if (currentBookData.coverUrl) {
                elements.coverPreview.src = currentBookData.coverUrl;
                elements.coverPreview.classList.remove('hidden');
                elements.coverPlaceholder.classList.add('hidden');
            } else {
                elements.coverPreview.classList.add('hidden');
                elements.coverPlaceholder.classList.remove('hidden');
            }

            // Render Chapters List
            elements.chaptersList.innerHTML = '';
            currentBookData.chapters.forEach((ch, idx) => {
                const item = document.createElement('div');
                item.className = 'chapter-item';
                const wordCount = ch.text.split(/\s+/).length;
                item.innerHTML = `
                    <span><strong>${idx + 1}.</strong> ${ch.title}</span>
                    <span class="pill">${wordCount.toLocaleString()} mots</span>
                `;
                elements.chaptersList.appendChild(item);
            });

            // Switch Screen
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
            <div class="dropzone-icon"><i class="fa-solid fa-cloud-arrow-up"></i></div>
            <h2>Glissez-déposez votre livre ici</h2>
            <p>Formats pris en charge : <strong>EPUB, PDF, DOCX, TXT, MOBI</strong></p>
            <button class="btn btn-primary" id="btnBrowseReload">
                <i class="fa-solid fa-folder-open"></i> Parcourir les fichiers
            </button>
        `;
        document.getElementById('btnBrowseReload')?.addEventListener('click', () => elements.fileInput.click());
    }

    elements.btnReset.addEventListener('click', resetToDropzone);
    elements.btnNewConversion.addEventListener('click', resetToDropzone);

    // Start Batch TTS Conversion
    elements.btnStartConversion.addEventListener('click', async () => {
        if (!currentBookData || currentBookData.chapters.length === 0) return;

        isConverting = true;
        isPaused = false;
        cancelRequested = false;
        generatedAudioFiles = [];

        // UI Switch
        elements.bookDetailsCard.classList.add('hidden');
        elements.progressCard.classList.remove('hidden');

        const voice = elements.selectVoice.value;
        const rate = parseInt(elements.rangeRate.value);
        const pitch = parseInt(elements.rangePitch.value);

        log(`Démarrage de la synthèse vocale pour "${elements.metaTitle.value}" avec la voix ${voice}...`, 'info');

        const totalChapters = currentBookData.chapters.length;
        const totalWordsOverall = currentBookData.chapters.reduce((sum, ch) => sum + ch.text.split(/\s+/).length, 0);
        let processedWordsOverall = 0;
        const startTime = Date.now();

        elements.metricWords.textContent = `0 / ${totalWordsOverall.toLocaleString()}`;

        for (let i = 0; i < totalChapters; i++) {
            if (cancelRequested) {
                log("Synthèse annulée par l'utilisateur.", 'warning');
                break;
            }

            const chapter = currentBookData.chapters[i];
            const chapWords = chapter.text.split(/\s+/).length;
            log(`Synthèse du Chapitre ${i + 1}/${totalChapters} : "${chapter.title}" (${chapWords} mots)...`);

            elements.progressStatusText.textContent = `Traitement : ${chapter.title}`;

            try {
                // Synthesize Chapter via Edge TTS WebSocket
                const audioBlob = await ttsClient.synthesize(chapter.text, { voice, rate, pitch });
                
                const safeTitle = chapter.title.replace(/[^a-zA-Z0-9àáâäãåąčćđéèêëėęėîïǐíìôöòóõøōǒùúûüųűÿýżźñçčšžÀÁÂÄÃÅĄĆČĐÉÈÊËĖĘÎÏÍÌÔÖÒÓÕØŌǑÙÚÛÜŲŰŸÝŻŹÑßÇŒÆ\s-]/g, "").trim();
                const filename = `${(i + 1).toString().padStart(3, '0')}_${safeTitle || 'Chapitre'}.mp3`;

                generatedAudioFiles.push({
                    filename: filename,
                    title: chapter.title,
                    blob: audioBlob
                });

                processedWordsOverall += chapWords;
                
                // Metrics update
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

                log(`Chapitre ${i + 1} terminé avec succès !`, 'success');

            } catch (err) {
                log(`Erreur lors de la synthèse du chapitre ${i + 1} : ${err.message}`, 'error');
            }
        }

        isConverting = false;

        if (!cancelRequested && generatedAudioFiles.length > 0) {
            log("Synthèse terminée avec succès ! Préparation des téléchargements...", 'success');
            showFinishedScreen();
        }
    });

    elements.btnCancelConversion.addEventListener('click', () => {
        if (confirm("Voulez-vous vraiment annuler la conversion en cours ?")) {
            cancelRequested = true;
            resetToDropzone();
        }
    });

    // Finished View & Zip Download
    function showFinishedScreen() {
        elements.progressCard.classList.add('hidden');
        elements.finishedCard.classList.remove('hidden');

        if (elements.chkEmbedTranscript.checked) {
            elements.btnDownloadTranscript.classList.remove('hidden');
        } else {
            elements.btnDownloadTranscript.classList.add('hidden');
        }
    }

    // Download Zip of all MP3s
    elements.btnDownloadAudiobook.addEventListener('click', async () => {
        if (generatedAudioFiles.length === 0) return;

        elements.btnDownloadAudiobook.disabled = true;
        elements.btnDownloadAudiobook.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Création de l'archive ZIP...`;

        try {
            const zip = new JSZip();
            const folder = zip.folder(elements.metaTitle.value || "Audiobook");

            generatedAudioFiles.forEach(item => {
                folder.file(item.filename, item.blob);
            });

            const zipBlob = await zip.generateAsync({ type: "blob" });
            const downloadUrl = URL.createObjectURL(zipBlob);

            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `${elements.metaTitle.value || 'Audiobook'}_MP3s.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

        } catch (err) {
            alert(`Erreur lors de la création du fichier ZIP : ${err.message}`);
        } finally {
            elements.btnDownloadAudiobook.disabled = false;
            elements.btnDownloadAudiobook.innerHTML = `<i class="fa-solid fa-file-audio"></i> Télécharger les Fichiers Audio (.zip)`;
        }
    });

    // Download Transcript Text file
    elements.btnDownloadTranscript.addEventListener('click', () => {
        if (!currentBookData) return;

        let fullTranscript = `=== ${elements.metaTitle.value} ===\nAuteur: ${elements.metaAuthor.value}\n\n`;
        currentBookData.chapters.forEach(ch => {
            fullTranscript += `--- ${ch.title} ---\n\n${ch.text}\n\n`;
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
