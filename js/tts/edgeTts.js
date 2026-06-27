/**
 * Client Edge TTS WebSocket en pure JavaScript (Client-Side)
 * Découpage automatique des textes longs & Reconnexion résiliente
 */

class EdgeTtsClient {
    constructor() {
        this.trustedToken = "6A5AA1D4EA5F4009A6C6230462002A54";
        
        this.voicesDatabase = [
            { ShortName: "fr-FR-RemyMultilingualNeural", LocalName: "Rémy (Multilingue)", Gender: "Male", Locale: "fr-FR" },
            { ShortName: "fr-FR-VivienneMultilingualNeural", LocalName: "Vivienne (Multilingue)", Gender: "Female", Locale: "fr-FR" },
            { ShortName: "fr-FR-DeniseNeural", LocalName: "Denise", Gender: "Female", Locale: "fr-FR" },
            { ShortName: "fr-FR-HenriNeural", LocalName: "Henri", Gender: "Male", Locale: "fr-FR" },
            { ShortName: "fr-CA-AntoineNeural", LocalName: "Antoine (Canada)", Gender: "Male", Locale: "fr-FR" },
            { ShortName: "fr-CA-SylvieNeural", LocalName: "Sylvie (Canada)", Gender: "Female", Locale: "fr-FR" },

            { ShortName: "en-US-AndrewMultilingualNeural", LocalName: "Andrew (US Multilingual)", Gender: "Male", Locale: "en-US" },
            { ShortName: "en-US-AvaMultilingualNeural", LocalName: "Ava (US Multilingual)", Gender: "Female", Locale: "en-US" },
            { ShortName: "en-US-ChristopherNeural", LocalName: "Christopher (US)", Gender: "Male", Locale: "en-US" },
            { ShortName: "en-GB-SoniaNeural", LocalName: "Sonia (UK)", Gender: "Female", Locale: "en-GB" },
            { ShortName: "en-GB-RyanNeural", LocalName: "Ryan (UK)", Gender: "Male", Locale: "en-GB" },

            { ShortName: "es-ES-AlvaroNeural", LocalName: "Álvaro", Gender: "Male", Locale: "es-ES" },
            { ShortName: "es-ES-ElviraNeural", LocalName: "Elvira", Gender: "Female", Locale: "es-ES" },

            { ShortName: "de-DE-ConradNeural", LocalName: "Conrad", Gender: "Male", Locale: "de-DE" },
            { ShortName: "de-DE-KatjaNeural", LocalName: "Katja", Gender: "Female", Locale: "de-DE" },

            { ShortName: "it-IT-DiegoNeural", LocalName: "Diego", Gender: "Male", Locale: "it-IT" },
            { ShortName: "it-IT-ElsaNeural", LocalName: "Elsa", Gender: "Female", Locale: "it-IT" }
        ];
    }

    getVoices(locale = "fr-FR") {
        return this.voicesDatabase.filter(v => v.Locale === locale || (locale.startsWith("en") && v.Locale.startsWith("en")));
    }

    generateRequestId() {
        return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    getTimestamp() {
        return new Date().toString();
    }

    /**
     * Découpe un long texte en sous-morceaux respectant la ponctuation (< 2000 caractères)
     */
    splitTextSmart(text, maxChars = 2000) {
        if (text.length <= maxChars) return [text];
        const chunks = [];
        let start = 0;
        const len = text.length;

        while (start < len) {
            if (len - start <= maxChars) {
                chunks.push(text.slice(start).trim());
                break;
            }
            let end = start + maxChars;
            let splitIdx = -1;
            for (const char of ['. ', '! ', '? ', '\n']) {
                const idx = text.lastIndexOf(char, end);
                if (idx > start && idx > splitIdx) {
                    splitIdx = idx + char.length;
                }
            }
            if (splitIdx === -1) {
                splitIdx = text.lastIndexOf(' ', end);
            }
            if (splitIdx === -1 || splitIdx <= start) {
                splitIdx = end;
            }
            const chunk = text.slice(start, splitIdx).trim();
            if (chunk.length > 0) chunks.push(chunk);
            start = splitIdx;
        }
        return chunks;
    }

    /**
     * Synthétise un chapitre complet (découpé automatiquement si trop long)
     */
    async synthesize(fullText, options = {}, onChunkProgress = null) {
        const textChunks = this.splitTextSmart(fullText, 2000);
        const audioBlobs = [];

        for (let i = 0; i < textChunks.length; i++) {
            const chunkText = textChunks[i];
            const blob = await this.synthesizeSingleChunk(chunkText, options);
            audioBlobs.push(blob);
            if (onChunkProgress) {
                onChunkProgress(i + 1, textChunks.length);
            }
        }

        // Fusionner les blobs MP3 du chapitre
        return new Blob(audioBlobs, { type: "audio/mp3" });
    }

    /**
     * Synthétise un morceau individuel (< 2000 caractères) via WebSocket
     */
    async synthesizeSingleChunk(text, options = {}) {
        return new Promise((resolve, reject) => {
            const voice = options.voice || "fr-FR-RemyMultilingualNeural";
            const rate = options.rate !== undefined ? (options.rate >= 0 ? `+${options.rate}%` : `${options.rate}%`) : "+0%";
            const pitch = options.pitch !== undefined ? (options.pitch >= 0 ? `+${options.pitch}Hz` : `${options.pitch}Hz`) : "+0Hz";
            const volume = "+0%";
            const langLocale = voice.split("-").slice(0, 2).join("-");

            const requestId = this.generateRequestId();
            const wsUrl = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${this.trustedToken}&ConnectionId=${requestId}`;

            const ws = new WebSocket(wsUrl);
            ws.binaryType = "arraybuffer";

            const audioChunks = [];
            let isCompleted = false;
            let errorMessage = null;

            // Timeout de sécurité si le serveur ne répond pas sous 15 secondes
            const timeoutTimer = setTimeout(() => {
                if (!isCompleted) {
                    ws.close();
                    reject(new Error("Délai d'attente dépassé (Timeout WebSocket)"));
                }
            }, 15000);

            ws.onopen = () => {
                const timestamp = this.getTimestamp();

                const configHeader = `Path: speech.config\r\nX-Timestamp: ${timestamp}\r\nContent-Type: application/json; charset=utf-8\r\n\r\n`;
                const configData = JSON.stringify({
                    context: {
                        synthesis: {
                            audio: {
                                metadataversion: "2020-05-01",
                                dataversion: "1"
                            },
                            language: {
                                name: langLocale
                            }
                        }
                    }
                });
                ws.send(configHeader + configData);

                const escapedText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                const ssmlHeader = `Path: ssml\r\nX-RequestId: ${requestId}\r\nX-Timestamp: ${timestamp}\r\nContent-Type: application/ssml+xml\r\n\r\n`;
                const ssmlData = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${langLocale}'><voice name='${voice}'><prosody pitch='${pitch}' rate='${rate}' volume='${volume}'>${escapedText}</prosody></voice></speak>`;

                ws.send(ssmlHeader + ssmlData);
            };

            ws.onmessage = (event) => {
                if (typeof event.data === "string") {
                    if (event.data.includes("Path: turn.end")) {
                        isCompleted = true;
                        clearTimeout(timeoutTimer);
                        ws.close();
                    }
                } else if (event.data instanceof ArrayBuffer) {
                    const dataView = new DataView(event.data);
                    const headerLength = dataView.getUint16(0);

                    const headerBytes = new Uint8Array(event.data, 2, headerLength);
                    const headerStr = new TextDecoder("utf-8").decode(headerBytes);

                    if (headerStr.includes("Path: audio")) {
                        const audioData = event.data.slice(2 + headerLength);
                        if (audioData.byteLength > 0) {
                            audioChunks.push(audioData);
                        }
                    }
                }
            };

            ws.onerror = (err) => {
                console.error("[EdgeTTS WS Error]", err);
                errorMessage = "Erreur réseau de connexion au service Bing TTS.";
            };

            ws.onclose = (evt) => {
                clearTimeout(timeoutTimer);
                if (audioChunks.length > 0) {
                    const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });
                    resolve(audioBlob);
                } else {
                    const reason = errorMessage || `Serveur déconnecté (Code ${evt.code}).`;
                    reject(new Error(reason));
                }
            };
        });
    }
}

window.EdgeTtsClient = EdgeTtsClient;
