# 🎧 audiolivreur.ai — Studio de Synthèse Vocale d'Audiobooks (v0.1 Web)

[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-brightgreen)](https://jul1n.github.io/AudioLivreur/)
[![Version](https://img.shields.io/badge/Version-v0.1-blue)](https://github.com/jul1n/AudioLivreur)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**audiolivreur.ai** est une Progressive Web App (PWA) **100% Client-Side** permettant de transformer vos livres numériques (EPUB, PDF, DOCX, TXT, MOBI) en livres audio MP3 de haute qualité, directement depuis votre navigateur web et en utilisant votre propre connexion internet.

---

## ✨ Fonctionnalités Clés

* 🟢 **100% Dans le Navigateur (Zero Server)** : La lecture du livre, l'extraction des chapitres et le packaging ZIP s'exécutent intégralement dans la mémoire de votre navigateur. Aucun fichier n'est téléversé sur un serveur externe.
* ⚡ **Requêtes Vocales sur IP Cliente** : La synthèse vocale communique en WebSocket directement depuis votre connexion internet vers le service public Microsoft Edge Read Aloud. Aucun risque de blocage ou d'erreur 429 liée à un serveur centralisé.
* 📖 **Support Multi-formats** : Extraction native des fichiers **EPUB**, **PDF**, **DOCX**, **TXT** et **MOBI**.
* 🎙️ **Voix Neuronales Internationales** : Choix de voix haute définition en Français, Anglais, Espagnol, Allemand, Italien... avec ajustement de la vitesse de lecture et du pitch.
* 🎨 **Design Neubrutaliste Épuré** : Interface moderne, intuitive et réactive avec fenêtres modales d'information.
* 📱 **PWA Installable** : Fonctionne hors-ligne et peut être installée comme une application sur Windows, macOS, iOS et Android.

---

## 🚀 Utilisation & Déploiement

### 1. En Ligne via GitHub Pages
L'application est directement accessible sans aucune installation sur :
👉 **[https://jul1n.github.io/AudioLivreur/](https://jul1n.github.io/AudioLivreur/)**

### 2. Lancement en Local
Pour lancer l'application localement sur votre ordinateur :
```bash
# Clonez le dépôt
git clone https://github.com/jul1n/AudioLivreur.git
cd AudioLivreur

# Lancez un petit serveur HTTP local (Python 3)
python -m http.server 8000
```
Ouvrez ensuite **`http://localhost:8000`** dans votre navigateur.

---

## 🏛️ Ancienne Version Desktop (Python)

Si vous cherchez la version initiale autonome pour Windows/macOS développée en Python (PyInstaller + CustomTkinter), elle a été archivée en toute sécurité sur la branche dédiée :
👉 **[Branche desktop-version](https://github.com/jul1n/AudioLivreur/tree/desktop-version)**

---

## 🛠️ Stack Technique Web (v0.1)

* **UI & Style** : HTML5, Vanilla CSS (Neubrutalism Design System), Google Fonts (*Space Grotesk* & *Plus Jakarta Sans*), FontAwesome.
* **Moteur TTS** : JavaScript WebSocket natif avec chiffrement DRM `Sec-MS-GEC` (Web Crypto API SHA-256).
* **Extracteurs de Documents** : `JSZip` (EPUB), `pdf.js` (PDF), `mammoth.browser.js` (DOCX).
