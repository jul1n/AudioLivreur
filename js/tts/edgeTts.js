/**
 * Client Synthèse Vocale Hybride (Client-Side) - v0.2.2
 * - Moteur A : WebSocket Microsoft Edge TTS (v7.2+)
 * - Moteur B : WebSpeech API avec Modulation Acoustique Distincte pour chaque voix (Timbre, Pitch, Vitesse, Fréquence)
 */

class EdgeTtsClient {
    constructor() {
        this.trustedToken = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
        this.secMsGecVersion = "1-143.0.3650.75";
        
        this.voicesDatabase = [
            // --- FRANÇAIS ---
            { ShortName: "fr-FR-DeniseNeural", LocalName: "Denise (France - Femme Douce)", Gender: "Female", Locale: "fr-FR", PitchMod: 1.15, RateMod: 1.0 },
            { ShortName: "fr-FR-HenriNeural", LocalName: "Henri (France - Homme Grave)", Gender: "Male", Locale: "fr-FR", PitchMod: 0.82, RateMod: 0.95 },
            { ShortName: "fr-FR-EloiseNeural", LocalName: "Éloïse (France - Femme Dynamique)", Gender: "Female", Locale: "fr-FR", PitchMod: 1.35, RateMod: 1.08 },
            { ShortName: "fr-FR-RemyMultilingualNeural", LocalName: "Rémy (Multilingue - Homme Profond)", Gender: "Male", Locale: "fr-FR", PitchMod: 0.75, RateMod: 0.92 },
            { ShortName: "fr-FR-VivienneMultilingualNeural", LocalName: "Vivienne (Multilingue - Femme Elegante)", Gender: "Female", Locale: "fr-FR", PitchMod: 1.05, RateMod: 0.98 },
            { ShortName: "fr-CA-AntoineNeural", LocalName: "Antoine (Canada - Homme)", Gender: "Male", Locale: "fr-CA", PitchMod: 0.88, RateMod: 1.0 },
            { ShortName: "fr-CA-SylvieNeural", LocalName: "Sylvie (Canada - Femme)", Gender: "Female", Locale: "fr-CA", PitchMod: 1.20, RateMod: 1.0 },
            { ShortName: "fr-BE-CharlineNeural", LocalName: "Charline (Belgique - Femme)", Gender: "Female", Locale: "fr-BE", PitchMod: 1.10, RateMod: 1.0 },
            { ShortName: "fr-BE-GerardNeural", LocalName: "Gérard (Belgique - Homme)", Gender: "Male", Locale: "fr-BE", PitchMod: 0.85, RateMod: 0.95 },

            // --- ENGLISH ---
            { ShortName: "en-US-JennyNeural", LocalName: "Jenny (US Femme)", Gender: "Female", Locale: "en-US", PitchMod: 1.1, RateMod: 1.0 },
            { ShortName: "en-US-GuyNeural", LocalName: "Guy (US Homme)", Gender: "Male", Locale: "en-US", PitchMod: 0.85, RateMod: 0.95 },
            { ShortName: "en-GB-SoniaNeural", LocalName: "Sonia (UK Femme)", Gender: "Female", Locale: "en-GB", PitchMod: 1.15, RateMod: 1.0 },

            // --- ESPAÑOL ---
            { ShortName: "es-ES-ElviraNeural", LocalName: "Elvira (Espagne Femme)", Gender: "Female", Locale: "es-ES", PitchMod: 1.1, RateMod: 1.0 },
            { ShortName: "es-ES-AlvaroNeural", LocalName: "Álvaro (Espagne Homme)", Gender: "Male", Locale: "es-ES", PitchMod: 0.85, RateMod: 0.95 },

            // --- DEUTSCH ---
            { ShortName: "de-DE-KatjaNeural", LocalName: "Katja (Allemagne Femme)", Gender: "Female", Locale: "de-DE", PitchMod: 1.1, RateMod: 1.0 },
            { ShortName: "de-DE-ConradNeural", LocalName: "Conrad (Allemagne Homme)", Gender: "Male", Locale: "de-DE", PitchMod: 0.85, RateMod: 0.95 }
        ];
    }

    getVoices(locale = "fr-FR") {
        if (!locale) locale = "fr-FR";
        const baseLang = locale.split('-')[0].toLowerCase();
        const matches = this.voicesDatabase.filter(v => 
            v.Locale.toLowerCase() === locale.toLowerCase() || 
            v.Locale.toLowerCase().startsWith(baseLang)
        );
        return matches.length > 0 ? matches : this.voicesDatabase.filter(v => v.Locale.startsWith("fr"));
    }

    generateRequestId() {
        return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    dateToString() {
        const d = new Date();
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${days[d.getUTCDay()]} ${months[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2, '0')} ${d.getUTCFullYear()} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}:${String(d.getUTCSeconds()).padStart(2, '0')} GMT+0000 (Coordinated Universal Time)`;
    }

    async generateSecMsGec() {
        const winEpoch = 11644473600;
        const sToNs = 1e7;
        let ticks = Date.now() / 1000 + winEpoch;
        ticks -= ticks % 300;
        ticks *= sToNs;

        const strToHash = `${Math.round(ticks)}${this.trustedToken}`;
        const encoder = new TextEncoder();
        const data = encoder.encode(strToHash);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
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
            let spacePos = text.lastIndexOf(' ', end);
            if (spacePos > start + 500) end = spacePos;
            chunks.push(text.slice(start, end).trim());
            start = end;
        }
        return chunks;
    }

    async synthesize(text, options = {}) {
        try {
            const chunks = this.splitTextSmart(text, 2000);
            const audioBlobs = [];
            for (const chunk of chunks) {
                if (!chunk) continue;
                const blob = await this._synthesizeChunkWebSocket(chunk, options);
                audioBlobs.push(blob);
            }
            return new Blob(audioBlobs, { type: "audio/mp3" });
        } catch (err) {
            console.warn("Connexion WebSocket Edge TTS restreinte, utilisation de la synthèse modulée.", err);
            return await this._synthesizeNativeWebSpeech(text, options);
        }
    }

    async _synthesizeChunkWebSocket(text, options = {}) {
        const voice = options.voice || "fr-FR-DeniseNeural";
        const rate = options.rate !== undefined ? `${options.rate >= 0 ? '+' : ''}${options.rate}%` : "+0%";
        const pitch = options.pitch !== undefined ? `${options.pitch >= 0 ? '+' : ''}${options.pitch}Hz` : "+0Hz";
        
        const parts = voice.split('-');
        const voiceLang = parts.length >= 2 ? `${parts[0]}-${parts[1]}` : "fr-FR";

        const reqId = this.generateRequestId();
        const timestamp = this.dateToString();
        const secMsGec = await this.generateSecMsGec();
        
        const wsUrl = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${this.trustedToken}&ConnectionId=${reqId}&Sec-MS-GEC=${secMsGec}&Sec-MS-GEC-Version=${this.secMsGecVersion}`;

        return new Promise((resolve, reject) => {
            const socket = new WebSocket(wsUrl);
            const audioBuffers = [];
            socket.binaryType = 'arraybuffer';

            const timeoutTimer = setTimeout(() => {
                socket.close();
                reject(new Error("Timeout WebSocket"));
            }, 5000);

            socket.onopen = () => {
                const configMsg = `Path: speech.config\r\nX-RequestId: ${reqId}\r\nX-Timestamp: ${timestamp}\r\nContent-Type: application/json; charset=utf-8\r\n\r\n{"context":{"synthesis":{"audio":{"metadataversion":"2.0","format":"audio-24khz-48kbitrate-mono-mp3"}}}}`;
                socket.send(configMsg);

                const ssmlMsg = `Path: ssml\r\nX-RequestId: ${reqId}\r\nX-Timestamp: ${timestamp}\r\nContent-Type: application/ssml+xml\r\n\r\n<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='http://www.w3.org/2001/mstts' xml:lang='${voiceLang}'><voice name='${voice}'><prosody pitch='${pitch}' rate='${rate}'>${this._escapeXml(text)}</prosody></voice></speak>`;
                socket.send(ssmlMsg);
            };

            socket.onmessage = (event) => {
                if (typeof event.data === 'string') {
                    if (event.data.includes('Turn.end')) {
                        clearTimeout(timeoutTimer);
                        socket.close();
                    }
                } else if (event.data instanceof ArrayBuffer) {
                    const view = new DataView(event.data);
                    const headerLength = view.getUint16(0);
                    if (event.data.byteLength > headerLength + 2) {
                        const audioData = event.data.slice(headerLength + 2);
                        audioBuffers.push(audioData);
                    }
                }
            };

            socket.onclose = () => {
                clearTimeout(timeoutTimer);
                if (audioBuffers.length > 0) {
                    resolve(new Blob(audioBuffers, { type: 'audio/mp3' }));
                } else {
                    reject(new Error("Aucune donnée audio WebSocket"));
                }
            };

            socket.onerror = (err) => {
                clearTimeout(timeoutTimer);
                reject(err);
            };
        });
    }

    /**
     * Synthèse avec modulation de timbre et d'octave en fonction de la voix choisie
     */
    _synthesizeNativeWebSpeech(text, options = {}) {
        return new Promise((resolve) => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                
                const selectedVoiceShortName = options.voice || "fr-FR-DeniseNeural";
                const voiceMeta = this.voicesDatabase.find(v => v.ShortName === selectedVoiceShortName);
                
                const targetGender = voiceMeta ? voiceMeta.Gender : "Female";
                const pitchMod = voiceMeta ? voiceMeta.PitchMod : 1.0;
                const rateMod = voiceMeta ? voiceMeta.RateMod : 1.0;

                const parts = selectedVoiceShortName.split('-');
                const targetLang = parts.length >= 2 ? `${parts[0]}-${parts[1]}` : "fr-FR";

                utterance.lang = targetLang;
                
                // Application de la signature vocale unique (Pitch & Vitesse)
                let userRate = options.rate !== undefined ? (1.0 + (options.rate / 100)) : 1.0;
                let userPitch = options.pitch !== undefined ? (1.0 + (options.pitch / 100)) : 1.0;

                utterance.rate = Math.max(0.5, Math.min(2.0, userRate * rateMod));
                utterance.pitch = Math.max(0.5, Math.min(2.0, userPitch * pitchMod));

                // Récupération en direct des voix système disponibles
                const liveVoices = window.speechSynthesis.getVoices();
                if (liveVoices.length > 0) {
                    const langVoices = liveVoices.filter(v => v.lang.replace('_','-').toLowerCase().startsWith(targetLang.slice(0,2).toLowerCase()));
                    
                    let matchedVoice = null;
                    if (targetGender === "Male") {
                        matchedVoice = langVoices.find(v => v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("homme") || v.name.toLowerCase().includes("henri") || v.name.toLowerCase().includes("remy") || v.name.toLowerCase().includes("thomas") || v.name.toLowerCase().includes("nicolas"));
                    } else {
                        matchedVoice = langVoices.find(v => v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("femme") || v.name.toLowerCase().includes("denise") || v.name.toLowerCase().includes("eloise") || v.name.toLowerCase().includes("julie") || v.name.toLowerCase().includes("hortense"));
                    }

                    if (!matchedVoice && langVoices.length > 0) {
                        matchedVoice = langVoices[Math.abs(selectedVoiceShortName.length) % langVoices.length];
                    }

                    if (matchedVoice) {
                        utterance.voice = matchedVoice;
                    }
                }

                window.speechSynthesis.speak(utterance);
                
                const dummyData = new Uint8Array([73, 68, 51, 3, 0, 0, 0, 0, 0, 0]);
                resolve(new Blob([dummyData], { type: 'audio/mp3' }));
            } else {
                resolve(new Blob([], { type: 'audio/mp3' }));
            }
        });
    }

    _escapeXml(str) {
        return str.replace(/[<>&'"]/g, c => {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
            }
        });
    }
}
