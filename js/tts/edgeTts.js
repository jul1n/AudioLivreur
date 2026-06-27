/**
 * Client Edge TTS WebSocket en pure JavaScript (Client-Side)
 * Reproduction exacte du protocole v7.2+ de Python edge-tts (DRM Sec-MS-GEC & Crypto Native)
 */

class EdgeTtsClient {
    constructor() {
        this.trustedToken = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
        this.secMsGecVersion = "1-143.0.3650.75";
        
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

    /**
     * Génère la chaîne de date au format GMT Bing TTS
     */
    dateToString() {
        const d = new Date();
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        const dayName = days[d.getUTCDay()];
        const monthName = months[d.getUTCMonth()];
        const day = String(d.getUTCDate()).padStart(2, '0');
        const year = d.getUTCFullYear();
        const hours = String(d.getUTCHours()).padStart(2, '0');
        const mins = String(d.getUTCMinutes()).padStart(2, '0');
        const secs = String(d.getUTCSeconds()).padStart(2, '0');

        return `${dayName} ${monthName} ${day} ${year} ${hours}:${mins}:${secs} GMT+0000 (Coordinated Universal Time)`;
    }

    /**
     * Génération du jeton DRM Sec-MS-GEC via Web Crypto API (SHA-256)
     */
    async generateSecMsGec() {
        const winEpoch = 11644473600;
        const sToNs = 1e7;

        let ticks = Date.now() / 1000;
        ticks += winEpoch;
        ticks -= ticks % 300;
        ticks *= sToNs;

        const strToHash = `${Math.round(ticks)}${this.trustedToken}`;
        
        const encoder = new TextEncoder();
        const data = encoder.encode(strToHash);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        return hashHex.toUpperCase();
    }

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

        return new Blob(audioBlobs, { type: "audio/mp3" });
    }

    async synthesizeSingleChunk(text, options = {}) {
        const secMsGec = await this.generateSecMsGec();

        return new Promise((resolve, reject) => {
            const voice = options.voice || "fr-FR-RemyMultilingualNeural";
            const rate = options.rate !== undefined ? (options.rate >= 0 ? `+${options.rate}%` : `${options.rate}%`) : "+0%";
            const pitch = options.pitch !== undefined ? (options.pitch >= 0 ? `+${options.pitch}Hz` : `${options.pitch}Hz`) : "+0Hz";
            const volume = "+0%";

            const requestId = this.generateRequestId();
            const wsUrl = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${this.trustedToken}&ConnectionId=${requestId}&Sec-MS-GEC=${secMsGec}&Sec-MS-GEC-Version=${this.secMsGecVersion}`;

            const ws = new WebSocket(wsUrl);
            ws.binaryType = "arraybuffer";

            const audioChunks = [];
            let isCompleted = false;
            let errorMessage = null;

            const timeoutTimer = setTimeout(() => {
                if (!isCompleted) {
                    ws.close();
                    reject(new Error("Délai d'attente dépassé (Timeout WebSocket)"));
                }
            }, 15000);

            ws.onopen = () => {
                const timestamp = this.dateToString();

                // 1. Send Command Request (exact format from edge-tts v7.2)
                const configMsg = `X-Timestamp:${timestamp}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"true"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}\r\n`;
                ws.send(configMsg);

                // 2. Clean text & Send SSML Request
                const cleanedText = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, " ");
                const escapedText = cleanedText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'><voice name='${voice}'><prosody pitch='${pitch}' rate='${rate}' volume='${volume}'>${escapedText}</prosody></voice></speak>`;
                
                const ssmlMsg = `X-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${timestamp}Z\r\nPath:ssml\r\n\r\n${ssml}`;
                ws.send(ssmlMsg);
            };

            ws.onmessage = (event) => {
                if (typeof event.data === "string") {
                    if (event.data.includes("Path:turn.end")) {
                        isCompleted = true;
                        clearTimeout(timeoutTimer);
                        ws.close();
                    }
                } else if (event.data instanceof ArrayBuffer) {
                    const dataView = new DataView(event.data);
                    const headerLength = dataView.getUint16(0);

                    const headerBytes = new Uint8Array(event.data, 2, headerLength);
                    const headerStr = new TextDecoder("utf-8").decode(headerBytes);

                    if (headerStr.includes("Path:audio")) {
                        const audioData = event.data.slice(2 + headerLength);
                        if (audioData.byteLength > 0) {
                            audioChunks.push(audioData);
                        }
                    }
                }
            };

            ws.onerror = (err) => {
                console.error("[EdgeTTS WS Error]", err);
                errorMessage = "Erreur de connexion réseau Bing TTS.";
            };

            ws.onclose = (evt) => {
                clearTimeout(timeoutTimer);
                if (audioChunks.length > 0) {
                    const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });
                    resolve(audioBlob);
                } else {
                    const reason = errorMessage || `Connexion interrompue (Code ${evt.code}).`;
                    reject(new Error(reason));
                }
            };
        });
    }
}

window.EdgeTtsClient = EdgeTtsClient;
