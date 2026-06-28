/**
 * Extracteur et analyseur de livres côté client (EPUB, PDF, DOCX, TXT)
 */

class FileParser {
    /**
     * Parse un fichier et retourne sa structure (titre, auteur, chapitres, pochette)
     * @param {File} file 
     * @returns {Promise<object>} { title, author, chapters: [{title, text}], coverUrl }
     */
    static async parse(file) {
        const ext = file.name.split('.').pop().toLowerCase();

        switch (ext) {
            case 'epub':
                return await this.parseEpub(file);
            case 'pdf':
                return await this.parsePdf(file);
            case 'docx':
                return await this.parseDocx(file);
            case 'txt':
            case 'md':
                return await this.parseTxt(file);
            default:
                throw new Error(`Format non pris en charge : .${ext}`);
        }
    }

    /**
     * Parsing EPUB via JSZip & DOMParser
     */
    static async parseEpub(file) {
        const zip = await JSZip.loadAsync(file);
        let title = file.name.replace(/\.[^/.]+$/, "");
        let author = "Auteur Inconnu";
        let coverUrl = null;
        const chapters = [];

        // 1. Trouver le fichier OPF via container.xml
        let opfPath = null;
        const containerFile = zip.file("META-INF/container.xml");
        if (containerFile) {
            const containerXml = await containerFile.async("text");
            const parser = new DOMParser();
            const doc = parser.parseFromString(containerXml, "text/xml");
            const rootFile = doc.querySelector("rootfile");
            if (rootFile) opfPath = rootFile.getAttribute("full-path");
        }

        // Si pas trouvé, chercher n'importe quel fichier .opf
        if (!opfPath) {
            const opfFiles = zip.file(/\.opf$/i);
            if (opfFiles.length > 0) opfPath = opfFiles[0].name;
        }

        // 2. Extraire métadonnées et liste des fichiers HTML
        const htmlFilesToRead = [];
        const coverPromises = [];
        if (opfPath) {
            const opfFile = zip.file(opfPath);
            if (opfFile) {
                const opfText = await opfFile.async("text");
                const parser = new DOMParser();
                const doc = parser.parseFromString(opfText, "text/xml");

                const titleEl = doc.querySelector("title");
                if (titleEl && titleEl.textContent) title = titleEl.textContent.trim();

                const creatorEl = doc.querySelector("creator");
                if (creatorEl && creatorEl.textContent) author = creatorEl.textContent.trim();

                // Chercher les éléments de manifest
                const items = doc.querySelectorAll("manifest > item");
                const basePath = opfPath.includes("/") ? opfPath.substring(0, opfPath.lastIndexOf("/") + 1) : "";

                items.forEach(item => {
                    const mediaType = item.getAttribute("media-type") || "";
                    const href = item.getAttribute("href");
                    if (mediaType.includes("html") || mediaType.includes("xhtml")) {
                        htmlFilesToRead.push(basePath + href);
                    }
                    // Chercher la couverture
                    const id = item.getAttribute("id") || "";
                    const properties = item.getAttribute("properties") || "";
                    if (properties.includes("cover-image") || id.includes("cover") || href.includes("cover") || mediaType.startsWith("image/")) {
                        const imgFile = zip.file(basePath + href);
                        if (!coverUrl && imgFile) {
                            coverPromises.push(
                                imgFile.async("blob").then(blob => {
                                    if (!coverUrl) coverUrl = URL.createObjectURL(blob);
                                })
                            );
                        }
                    }
                });
            }
        }
        await Promise.all(coverPromises);

        // Fallback si la structure OPF n'a pas listé les HTML : prendre tous les html
        if (htmlFilesToRead.length === 0) {
            const allHtml = zip.file(/\.(html|xhtml|htm)$/i);
            allHtml.forEach(f => htmlFilesToRead.push(f.name));
        }

        // 3. Extraire le texte de chaque chapitre
        const parser = new DOMParser();
        for (let i = 0; i < htmlFilesToRead.length; i++) {
            const path = htmlFilesToRead[i];
            const htmlFile = zip.file(path);
            if (!htmlFile) continue;

            const content = await htmlFile.async("text");
            // Ajout de sauts de ligne autour des balises de bloc pour éviter que les mots se collent (ex: TitreLe texte)
            let cleanHtml = content.replace(/<\/(p|div|h[1-6]|li|blockquote|tr)>/gi, "\n</$1>");
            cleanHtml = cleanHtml.replace(/<br\s*\/?>/gi, "\n");
            
            const doc = parser.parseFromString(cleanHtml, "text/html");

            // Retirer les scripts et styles
            doc.querySelectorAll("script, style, svg").forEach(el => el.remove());

            const rawText = doc.body ? doc.body.textContent.trim() : "";
            // Ne garder que les chapitres avec du contenu substantiel (> 80 caractères)
            if (rawText.length > 80) {
                const chapWord = (window.t && window.t('chapter_default')) ? window.t('chapter_default') : 'Chapitre';
                let chapTitle = `${chapWord} ${chapters.length + 1}`;
                const heading = doc.querySelector("h1, h2, h3");
                if (heading && heading.textContent.trim()) {
                    chapTitle = heading.textContent.trim().substring(0, 50);
                }

                // Nettoyer les sauts de lignes multiples et la ponctuation
                let cleanText = rawText.replace(/\n\s*\n/g, '\n\n');
                cleanText = FileParser.sanitizeText(cleanText);
                
                chapters.push({
                    title: chapTitle,
                    text: cleanText
                });
            }
        }

        if (chapters.length === 0) {
            throw new Error("Aucun texte exploitable n'a pu être extrait de l'EPUB.");
        }

        return { title, author, chapters, coverUrl };
    }

    /**
     * Parsing PDF via PDF.js
     */
    static async parsePdf(file) {
        if (typeof pdfjsLib === 'undefined') {
            throw new Error("La bibliothèque PDF.js n'est pas chargée.");
        }

        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + "\n\n";
        }

        const title = file.name.replace(/\.[^/.]+$/, "");
        
        // Découper automatiquement le PDF en gros morceaux si aucun chapitre n'est présent
        const chapters = this.splitTextIntoChapters(fullText, title);

        return {
            title: title,
            author: "Auteur PDF",
            chapters: chapters,
            coverUrl: null
        };
    }

    /**
     * Parsing DOCX via Mammoth.js
     */
    static async parseDocx(file) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
        const fullText = result.value;

        const title = file.name.replace(/\.[^/.]+$/, "");
        const chapters = this.splitTextIntoChapters(fullText, title);

        return {
            title: title,
            author: "Document Word",
            chapters: chapters,
            coverUrl: null
        };
    }

    /**
     * Parsing Fichier Texte brut (.txt / .md)
     */
    static async parseTxt(file) {
        const text = await file.text();
        const title = file.name.replace(/\.[^/.]+$/, "");
        const chapters = this.splitTextIntoChapters(text, title);

        return {
            title: title,
            author: "Fichier Texte",
            chapters: chapters,
            coverUrl: null
        };
    }

    /**
     * Découpeur intelligent de long texte en chapitres pour la synthèse
     */
    static splitTextIntoChapters(fullText, defaultTitle) {
        const chapters = [];
        // Chercher des séparateurs de chapitres classiques (ex: Chapitre 1, Chapter 1, etc.)
        const parts = fullText.split(/(?=\n(?:Chapitre|Chapter|PARTIE|SECTION)\s+\d+)/i);

        if (parts.length > 1) {
            parts.forEach((part, idx) => {
                const text = part.trim();
                if (text.length > 50) {
                    const firstLine = text.split('\n')[0].substring(0, 40);
                    chapters.push({
                        title: firstLine.length > 3 ? firstLine : `Partie ${idx + 1}`,
                        text: FileParser.sanitizeText(text)
                    });
                }
            });
        }

        // Si aucun séparateur explicite n'a été trouvé, découper par blocs de 4000 mots (~15-20 min de lecture)
        if (chapters.length === 0) {
            const words = fullText.split(/\s+/);
            const wordsPerChunk = 3500;
            for (let i = 0; i < words.length; i += wordsPerChunk) {
                const chunkWords = words.slice(i, i + wordsPerChunk);
                const chunkText = chunkWords.join(' ');
                const chunkIndex = Math.floor(i / wordsPerChunk) + 1;
                chapters.push({
                    title: `${defaultTitle} - Partie ${chunkIndex}`,
                    text: FileParser.sanitizeText(chunkText)
                });
            }
        }

        return chapters;
    }

    /**
     * Force l'ajout d'un espace après une ponctuation si celle-ci est directement
     * collée à une majuscule ou un tiret (ex: Quigley.C'était -> Quigley. C'était).
     */
    static sanitizeText(text) {
        if (!text) return "";
        // Ajoute un espace entre la ponctuation (. ? ! :) et une majuscule ou un tiret
        // Évite que le moteur vocal lise le point à haute voix comme une adresse web.
        let sanitized = text.replace(/([.?!:])([A-ZÀ-Ÿ-])/g, '$1 $2');
        // Gérer le cas spécifique de l'espace suivi d'un tiret collé à la ponctuation (ex: ".-")
        sanitized = sanitized.replace(/([.?!:]) -/g, '$1 -');
        return sanitized;
    }
}

window.FileParser = FileParser;
