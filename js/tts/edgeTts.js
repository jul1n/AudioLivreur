/**
 * Client Edge TTS WebSocket en pure JavaScript (Client-Side)
 * Communique directement avec le service Microsoft Edge Read Aloud
 */

class EdgeTtsClient {
    constructor() {
        this.trustedToken = "6A5AA1D4EA5F4009A6C6230462002A54";
        this.wsUrl = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${this.trustedToken}`;
        
        // Liste des voix neuronales haute qualité de référence par langue
        this.voicesDatabase = [
            // Français
            { ShortName: "fr-FR-RemyMultilingualNeural", LocalName: "Rémy (Multilingue)", Gender: "Male", Locale: "fr-FR" },
            { ShortName: "fr-FR-VivienneMultilingualNeural", LocalName: "Vivienne (Multilingue)", Gender: "Female", Locale: "fr-FR" },
            { ShortName: "fr-FR-DeniseNeural", LocalName: "Denise", Gender: "Female", Locale: "fr-FR" },
            { ShortName: "fr-FR-HenriNeural", LocalName: "Henri", Gender: "Male", Locale: "fr-FR" },
            { ShortName: "fr-CA-AntoineNeural", LocalName: "Antoine (Canada)", Gender: "Male", Locale: "fr-FR" },
            { ShortName: "fr-CA-SylvieNeural", LocalName: "Sylvie (Canada)", Gender: "Female", Locale: "fr-FR" },

            // Anglais US & UK
            { ShortName: "en-US-AndrewMultilingualNeural", LocalName: "Andrew (US Multilingual)", Gender: "Male", Locale: "en-US" },
            { ShortName: "en-US-AvaMultilingualNeural", LocalName: "Ava (US Multilingual)", Gender: "Female", Locale: "en-US" },
            { ShortName: "en-US-ChristopherNeural", LocalName: "Christopher (US)", Gender: "Male", Locale: "en-US" },
            { ShortName: "en-GB-SoniaNeural", LocalName: "Sonia (UK)", Gender: "Female", Locale: "en-GB" },
            { ShortName: "en-GB-RyanNeural", LocalName: "Ryan (UK)", Gender: "Male", Locale: "en-GB" },

            // Espagnol
            { ShortName: "es-ES-AlvaroNeural", LocalName: "Álvaro", Gender: "Male", Locale: "es-ES" },
            { ShortName: "es-ES-ElviraNeural", LocalName: "Elvira", Gender: "Female", Locale: "es-ES" },

            // Allemand
            { ShortName: "de-DE-ConradNeural", LocalName: "Conrad", Gender: "Male", Locale: "de-DE" },
            { ShortName: "de-DE-KatjaNeural", LocalName: "Katja", Gender: "Female", Locale: "de-DE" },

            // Italien
            { ShortName: "it-IT-DiegoNeural", LocalName: "Diego", Gender: "Male", Locale: "it-IT" },
            { ShortName: "it-IT-ElsaNeural", LocalName: "Elsa", Gender: "Female", Locale: "it-IT" }
        ];
    }

    /**
     * Retourne la liste des voix filtrées par langue
     */
    getVoices(locale = "fr-FR") {
        return this.voicesDatabase.filter(v => v.Locale === locale || (locale.startsWith("en") && v.Locale.startsWith("en")));
    }

    /**
     * Génère un UUID v4 simple pour la requête
     */
    generateRequestId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Synthétise un extrait de texte en audio MP3
     * @param {string} text Le texte à lire
     * @param {object} options { voice, rate, pitch, volume }
     * @param {function} onWordProgress Callback pour le nombre de mots traités
     * @returns {Promise<Blob>} Le fichier audio au format Blob MP3
     */
    async synthesize(text, options = {}, onWordProgress = null) {
        return new Promise((resolve, reject) => {
            const voice = options.voice || "fr-FR-RemyMultilingualNeural";
            const rate = options.rate !== undefined ? (options.rate >= 0 ? `+${options.rate}%` : `${options.rate}%`) : "+0%";
            const pitch = options.pitch !== undefined ? (options.pitch >= 0 ? `+${options.pitch}Hz` : `${options.pitch}Hz`) : "+0Hz";
            const volume = "+0%";

            const ws = new WebSocket(this.wsUrl);
            ws.binaryType = "arraybuffer";

            const audioChunks = [];
            const requestId = this.generateRequestId();
            let isCompleted = false;

            ws.onopen = () => {
                // 1. Envoyer la configuration de la session
                const configHeader = "Path: speech.config\r\nContent-Type: application/json; charset=utf-8\r\n\r\n";
                const configData = JSON.stringify({
                    context: {
                        synthesis: {
                            audio: {
                                metadataversion: "2020-05-01",
                                dataversion: "1"
                            },
                            language: {
                                name: voice.split("-").slice(0, 2).join("-")
                            }
                        }
                    }
                });
                ws.send(configHeader + configData);

                // 2. Échapper le texte pour le format SSML XML
                const escapedText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                
                // 3. Envoyer le message SSML
                const ssmlHeader = `Path: ssml\r\nX-RequestId: ${requestId}\r\nContent-Type: application/ssml+xml\r\n\r\n`;
                const ssmlData = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'><voice name='${voice}'><prosody pitch='${pitch}' rate='${rate}' volume='${volume}'>${escapedText}</prosody></voice></speak>`;
                
                ws.send(ssmlHeader + ssmlData);
            };

            ws.onmessage = (event) => {
                if (typeof event.data === "string") {
                    // Message texte (généralement statut ou métadonnées)
                    if (event.data.includes("Path: turn.end")) {
                        isCompleted = true;
                        ws.close();
                    }
                } else if (event.data instanceof ArrayBuffer) {
                    // Message binaire contenant l'audio MP3
                    const dataView = new DataView(event.data);
                    const headerLength = dataView.getUint16(0);
                    
                    const headerBytes = new Uint8Array(event.data, 2, headerLength);
                    const headerStr = new TextDecoder("utf-8").decode(headerBytes);

                    if (headerStr.includes("Path: audio")) {
                        const audioData = event.data.slice(2 + headerLength);
                        audioChunks.push(audioData);
                        if (onWordProgress) {
                            onWordProgress(50); // Simulation/mise à jour du progrès
                        }
                    }
                }
            };

            ws.onerror = (err) => {
                console.error("[EdgeTTS WS Error]", err);
                reject(new Error("Erreur de connexion au service vocal Edge-TTS"));
            };

            ws.onclose = () => {
                if (audioChunks.length > 0) {
                    const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });
                    resolve(audioBlob);
                } else if (!isCompleted) {
                    reject(new Error("Connexion fermée avant la fin de la synthèse"));
                }
            };
        });
    }
}

// Export global pour utilisation navigateur
window.EdgeTtsClient = EdgeTtsClient;
