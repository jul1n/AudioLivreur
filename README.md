# AudioLivreur - Convertisseur Ebook vers Audiobook

# AudioLivreur 🎧
> Convertisseur Ebook vers Audiobook

[![Télécharger la dernière version](https://img.shields.io/badge/Télécharger-Windows_(.exe)-blue?style=for-the-badge&logo=windows)](https://github.com/jul1n/AudioLivreur/releases/latest/download/AudioLivreur.exe)

[Voir les instructions d'installation](#-installation-rapide)
<img width="791" height="721" alt="image" src="https://github.com/user-attachments/assets/9e6cc9c1-4025-4ab3-8abe-6ec325cee48a" />

**Version:** 0.3.1  
**Date:** 29 novembre 2025

Convertissez vos ebooks (EPUB, PDF, DOCX, etc.) en audiobooks M4B avec chapitres, utilisant la synthèse vocale Microsoft Edge TTS.

## ✨ Fonctionnalités

- 📚 **Multi-formats** : EPUB, PDF, DOCX, TXT, MD, MOBI, AZW3
- 🎙️ **Synthèse vocale** : Plus de 400 voix Microsoft Edge TTS (gratuit)
- 📖 **Chapitrage automatique** : Détection et marquage des chapitres
- 🌍 **Interface bilingue** : Français et Anglais
- 💾 **Export MP3** : Sauvegarde optionnelle des fichiers MP3 individuels
- ⏱️ **Estimation du temps** : Affichage du temps de conversion estimé
- 🎨 **Interface moderne** : Design épuré avec CustomTkinter
- 🔄 **Glisser-déposer** : Interface intuitive

## 🚀 Installation Rapide

### Prérequis

1. **Python 3.8+** (pour la version source)
2. **FFmpeg** - [Télécharger ici](https://github.com/BtbN/FFmpeg-Builds/releases)

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/votre-repo/CalibAudio.git
cd CalibAudio/CalibAudioStandalone

# Installer les dépendances
pip install -r requirements.txt

# Lancer l'application
python gui.py
```

### Version Exécutable

Téléchargez simplement `AudioLivreur.exe` et lancez-le. Aucune installation requise !

## 📖 Utilisation

1. **Lancez AudioLivreur**
2. **Glissez-déposez** votre fichier ebook
3. **Configurez** la voix et les paramètres (optionnel)
4. **Cliquez** sur "Démarrer la Conversion"
5. **Récupérez** votre audiobook M4B !

Pour plus de détails, consultez le [Guide Utilisateur](GUIDE_UTILISATEUR.md).

## 🔧 Configuration

### FFmpeg

AudioLivreur détecte automatiquement FFmpeg s'il est installé dans :
- Le PATH système
- `C:\ffmpeg\bin\`
- `C:\Program Files\ffmpeg\bin\`

Sinon, spécifiez le chemin manuellement dans les paramètres.

### Voix Recommandées

**Français :**
- `fr-FR-VivienneMultilingualNeural` (Féminine)
- `fr-FR-RemyMultilingualNeural` (Masculine)

**Anglais :**
- `en-US-AriaNeural` (Féminine)
- `en-US-GuyNeural` (Masculine)

## 📝 Notes de Version

### v0.3.1 (2025-11-29)

**Corrections de bugs :**
- ✅ Correction de fuite de ressources (event loop)
- ✅ Auto-détection de FFmpeg
- ✅ Correction de la race condition de chargement des voix

**Améliorations :**
- ✅ Estimation du temps de conversion
- ✅ Optimisation du comptage de mots (performance +30%)
- ✅ Meilleurs messages d'erreur FFmpeg
- ✅ Versions des dépendances épinglées

## 🛠️ Compilation

Pour créer un exécutable :

```bash
pyinstaller build.spec
```

L'exécutable sera dans le dossier `dist/`.

## 📚 Documentation

- [Guide Utilisateur](GUIDE_UTILISATEUR.md) - Guide complet d'utilisation
- [Code Review](../../.gemini/antigravity/brain/0f4a1ed2-63ea-4edc-b595-1232c12fd35e/code_review.md) - Analyse technique
- [Walkthrough](../../.gemini/antigravity/brain/0f4a1ed2-63ea-4edc-b595-1232c12fd35e/walkthrough.md) - Détails des changements

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

Usage personnel uniquement. Respectez les droits d'auteur des livres que vous convertissez.

## 🙏 Remerciements

- Microsoft Edge TTS pour la synthèse vocale gratuite
- FFmpeg pour le traitement audio
- CustomTkinter pour l'interface moderne

---

**AudioLivreur** - Transformez vos ebooks en audiobooks ! 🎧📚
