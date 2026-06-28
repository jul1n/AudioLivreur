/**
 * Studio Synthèse Vocale 100% Web Speech API (Voix Système du navigateur)
 * Version Démonstration Web pour GitHub Pages
 */
class EdgeTtsClient {
    constructor() {
        this.synth = window.speechSynthesis;
        this.systemVoices = [];
        this._initVoices();
    }

    _initVoices() {
        if (!this.synth) return;
        this.systemVoices = this.synth.getVoices();
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => {
                this.systemVoices = this.synth.getVoices();
            };
        }
    }

    getVoices(locale = "fr") {
        if (!this.synth) return [];
        this.systemVoices = this.synth.getVoices();
        const baseLang = locale.split('-')[0].toLowerCase();
        
        let matches = this.systemVoices.filter(v => v.lang.toLowerCase().replace('_', '-').startsWith(baseLang));
        if (matches.length === 0) {
            matches = this.systemVoices;
        }

        if (matches.length === 0) {
            return [{
                ShortName: "Voix Système Synthèse",
                LocalName: "Voix Système (Par Défaut)",
                Gender: "Neutral",
                Locale: locale
            }];
        }

        return matches.map(v => ({
            ShortName: v.name,
            LocalName: `${v.name} (${v.lang})`,
            Gender: "Neutral",
            Locale: v.lang
        }));
    }

    async testVoice(text, options = {}, statusCallback = null) {
        if (!this.synth) throw new Error("Web Speech API non supportée sur ce navigateur.");
        if (statusCallback) statusCallback("Lecture vocale système...");
        
        return new Promise((resolve, reject) => {
            this.synth.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            
            const voices = this.synth.getVoices();
            const selectedVoice = voices.find(v => v.name === options.voice);
            if (selectedVoice) utterance.voice = selectedVoice;

            if (options.rate !== undefined) {
                utterance.rate = Math.max(0.5, Math.min(2, 1 + (options.rate / 100)));
            }
            if (options.pitch !== undefined) {
                utterance.pitch = Math.max(0, Math.min(2, 1 + (options.pitch / 100)));
            }

            utterance.onend = () => resolve();
            utterance.onerror = (err) => reject(err);

            this.synth.speak(utterance);
        });
    }

    async synthesize(text, options = {}, progressCallback = null) {
        if (!this.synth) throw new Error("Web Speech API non supportée.");

        return new Promise((resolve, reject) => {
            this.synth.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            const voices = this.synth.getVoices();
            const selectedVoice = voices.find(v => v.name === options.voice);
            if (selectedVoice) utterance.voice = selectedVoice;

            if (options.rate !== undefined) utterance.rate = Math.max(0.5, Math.min(2, 1 + (options.rate / 100)));
            if (options.pitch !== undefined) utterance.pitch = Math.max(0, Math.min(2, 1 + (options.pitch / 100)));

            utterance.onend = () => {
                const dummyBlob = new Blob([new Uint8Array(100)], { type: "audio/mp3" });
                resolve(dummyBlob);
            };
            utterance.onerror = (e) => reject(e);

            this.synth.speak(utterance);
        });
    }
}
