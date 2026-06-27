/**
 * Client Edge TTS WebSocket en pure JavaScript (Client-Side)
 * Reproduction exacte du protocole v7.2+ de Python edge-tts (DRM Sec-MS-GEC & Crypto Native)
 */

class EdgeTtsClient {
    constructor() {
        this.trustedToken = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
        this.secMsGecVersion = "1-143.0.3650.75";
        
        // Les voix de production haute stabilité en premier
        this.voicesDatabase = [
            { ShortName: "fr-FR-DeniseNeural", LocalName: "Denise (Standard)", Gender: "Female", Locale: "fr-FR" },
            { ShortName: "fr-FR-HenriNeural", LocalName: "Henri (Standard)", Gender: "Male", Locale: "fr-FR" },
            { ShortName: "fr-FR-RemyMultilingualNeural", LocalName: "Rémy (Multilingue)", Gender: "Male", Locale: "fr-FR" },
            { ShortName: "fr-FR-VivienneMultilingualNeural", LocalName: "Vivienne (Multilingue)", Gender: "Female", Locale: "fr-FR" },
            { ShortName: "fr-CA-AntoineNeural", LocalName: "Antoine (Canada)", Gender: "Male", Locale: "fr-FR" },
            { ShortName: "fr-CA-SylvieNeural", LocalName: "Sylvie (Canada)", Gender: "Female", Locale: "fr-FR" },

            { ShortName: "en-US-JennyNeural", LocalName: "Jenny (US)", Gender: "Female", Locale: "en-US" },
            { ShortName: "en-US-GuyNeural", LocalName: "Guy (US)", Gender: "Male", Locale: "en-US" },
            { ShortName: "en-US-AndrewMultilingualNeural", LocalName: "Andrew (US Multilingual)", Gender: "Male", Locale: "en-US" },
            { ShortName: "en-GB-SoniaNeural", LocalName: "Sonia (UK)", Gender: "Female", Locale: "en-GB" },
            { ShortName: "en-GB-RyanNeural", LocalName: "Ryan (UK)", Gender: "Male", Locale: "en-GB" },

            { ShortName: "es-ES-ElviraNeural", LocalName: "Elvira", Gender: "Female", Locale: "es-ES" },
            { ShortName: "es-ES-AlvaroNeural", LocalName: "Álvaro", Gender: "Male", Locale: "es-ES" },

            { ShortName: "de-DE-KatjaNeural", LocalName: "Katja", Gender: "Female", Locale: "de-DE" },
            { ShortName: "de-DE-ConradNeural", LocalName: "Conrad", Gender: "Male", Locale: "de-DE" },

            { ShortName: "it-IT-ElsaNeural", LocalName: "Elsa", Gender: "Female", Locale: "it-IT" },
            { ShortName: "it-IT-DiegoNeural", LocalName: "Diego", Gender: "Male", Locale: "it-IT" }
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
        
        const dayName = days[d.getUTCDay()];
        const monthName = months[d.getUTCMonth()];
        const day = String(d.getUTCDate()).padStart(2, '0');
        const year = d.getUTCFullYear();
        const hours = String(d.getUTCHours()).padStart(2, '0');
        const mins = String(d.getUTCMinutes()).padStart(2, '0');
        const secs = String(d.getUTCSeconds()).padStart(2, '0');

        return `${dayName} ${monthName} ${day} ${year} ${hours}:${mins}:${secs} GMT+0000 (Coordinated Universal Time)`;
    }

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
            let spacePos = text.lastIndexOf(' ', end);
            if (spacePos > start + 500) end = spacePos;
            chunks.push(text.slice(start, end).trim());
            start = end;
        }
        return chunks;
    }

    async synthesize(text, options = {}) {
        const chunks = this.splitTextSmart(text, 2000);
        const audioBlobs = [];

        for (const chunk of chunks) {
            if (!chunk) continue;
            const blob = await this._synthesizeChunk(chunk, options);
            audioBlobs.push(blob);
        }

        return new Blob(audioBlobs, { type: "audio/mp3" });
    }

    async _synthesizeChunk(text, options = {}) {
        const voice = options.voice || "fr-FR-DeniseNeural";
        const rate = options.rate !== undefined ? `${options.rate >= 0 ? '+' : ''}${options.rate}%` : "+0%";
        const pitch = options.pitch !== undefined ? `${options.pitch >= 0 ? '+' : ''}${options.pitch}Hz` : "+0Hz";
        
        // Détermination dynamique de la langue SSML correspondant à la voix choisie
        const parts = voice.split('-');
        const voiceLang = parts.length >= 2 ? `${parts[0]}-${parts[1]}` : "fr-FR";

        const secMsGec = await this.generateSecMsGec();
        const wsUrl = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${this.trustedToken}&Sec-MS-GEC=${secMsGec}&Sec-MS-GEC-Version=${this.secMsGecVersion}`;

        return new Promise((resolve, reject) => {
            const socket = new WebSocket(wsUrl);
            const audioBuffers = [];

            socket.binaryType = 'arraybuffer';

            socket.onopen = () => {
                const reqId = this.generateRequestId();
                const configMsg = `Path: speech.config\r\nX-RequestId: ${reqId}\r\nContent-Type: application/json; charset=utf-8\r\n\r\n{"context":{"synthesis":{"audio":{"metadataversion":"2.0","format":"audio-24khz-48kbitrate-mono-mp3"}}}}`;
                socket.send(configMsg);

                // xml:lang doit impérativement correspondre à la langue de la voix sélectionnée !
                const ssmlMsg = `Path: ssml\r\nX-RequestId: ${reqId}\r\nContent-Type: application/ssml+xml\r\n\r\n<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${voiceLang}'><voice name='${voice}'><prosody pitch='${pitch}' rate='${rate}'>${this._escapeXml(text)}</prosody></voice></speak>`;
                socket.send(ssmlMsg);
            };

            socket.onmessage = (event) => {
                if (typeof event.data === 'string') {
                    if (event.data.includes('Turn.end')) socket.close();
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
                if (audioBuffers.length > 0) {
                    resolve(new Blob(audioBuffers, { type: 'audio/mp3' }));
                } else {
                    reject(new Error("Aucune donnée audio reçue du service TTS Microsoft. Assurez-vous d'utiliser une voix standard (ex: Denise)."));
                }
            };

            socket.onerror = (err) => reject(new Error("Erreur de connexion WebSocket Edge TTS."));
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
