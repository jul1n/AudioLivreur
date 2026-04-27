# AudioLivreur - Convertisseur Ebook vers Audiobook

# AudioLivreur 🎧
> Convertisseur Ebook vers Audiobook

[![Télécharger la dernière version](https://img.shields.io/badge/Télécharger-Windows_(.exe)-blue?style=for-the-badge&logo=windows)](https://github.com/jul1n/AudioLivreur/releases/latest/download/AudioLivreur.exe)

[Voir les instructions d'installation](#-installation-rapide)
<img width="791" height="721" alt="image" src="https://github.com/user-attachments/assets/9e6cc9c1-4025-4ab3-8abe-6ec325cee48a" />

Convertissez vos ebooks (EPUB, PDF, DOCX, etc.) en audiobooks M4B avec chapitres, utilisant la synthèse vocale Microsoft Edge TTS.

## ✨ Fonctionnalités

- 📚 **Multi-formats** : EPUB, PDF, DOCX, TXT, MD, MOBI, AZW3
- 🌍 **Support Global** : Plus de 75 langues supportées nativement
- 🎙️ **Synthèse vocale** : Voix Neural & Multilingual de haute qualité
- 📖 **Chapitrage & Pochette** : Extraction automatique et robuste
- 📦 **Standalone** : FFmpeg intégré, aucune installation requise
- ⏯️ **Pause / Reprise** : Gérez votre progression en temps réel
- 🧺 **Traitement par lot** : Glissez plusieurs fichiers d'un coup
- 💾 **Export Avancé** : MP3 Global, Chapitres séparés, Intégration des paroles (Lyrics) et Transcript texte
- 🌍 **Interface Polyglotte** : Français, Anglais, Espagnol, Allemand, Italien, Portugais, Chinois, etc.

## 🚀 Installation & Téléchargement

### 1. Choisir votre version
Rendez-vous sur la page des [Releases GitHub](https://github.com/jul1n/AudioLivreur/releases/latest) pour télécharger la dernière version :

*   📦 **Version FULL (`AudioLivreur-Full.exe`)** : **Recommandé.** Tout est inclus (FFmpeg/FFprobe). Téléchargez, lancez, profitez ! (~210 Mo)
*   🪶 **Version LIGHT (`AudioLivreur-Light.exe`)** : Pour les utilisateurs ayant déjà FFmpeg sur leur PC. Ultra-léger (~25 Mo).

---

### 2. Guide d'installation étape par étape

#### Pour la version FULL (Autonome) :
1.  **Téléchargez** `AudioLivreur-Full.exe`.
2.  **Double-cliquez** sur le fichier pour lancer l'application.
3.  C'est tout ! L'application détectera automatiquement les outils internes.

#### Pour la version LIGHT (Sans FFmpeg) :
1.  **Téléchargez** `AudioLivreur-Light.exe`.
2.  **Installez FFmpeg** (si pas déjà fait) :
    *   Téléchargez les binaires sur [ffmpeg.org](https://ffmpeg.org/download.html#build-windows).
    *   Extrayez-les (ex: dans `C:\ffmpeg`).
3.  **Configurez l'application** :
    *   Lancez `AudioLivreur-Light.exe`.
    *   Allez dans les **Paramètres ⚙️**.
    *   Si FFmpeg n'est pas détecté, cliquez sur l'icône dossier 📂 à côté de "Chemin FFmpeg" et sélectionnez votre fichier `ffmpeg.exe`.

---

### Version Source (Développeurs)
1. **Python 3.12+**
2. **Installation des dépendances** : `pip install -r requirements.txt`
3. **Lancement** : `python main.py`

## 📖 Utilisation Rapide
1. **Glissez-déposez** un ou plusieurs ebooks (EPUB, PDF, etc.).
2. **Sélectionnez la langue** et écoutez un **aperçu** de la voix.
3. **Lancez la conversion** et récupérez vos fichiers dans le dossier source.


Pour plus de détails, consultez le [Guide Utilisateur](GUIDE_UTILISATEUR.md).

## 📝 Notes de Version

### v0.5.0 (Nouveau)
**L'AudioLivreur Polyglotte :**
- 🌍 **75+ Langues** : Support complet de toutes les langues de Microsoft Edge TTS.
- 🎛️ **Sélecteur de langue direct** : Changez la langue de la voix en un clic sans quitter l'onglet principal.
- 💾 **Exports enrichis** : Option pour générer un fichier MP3 global fusionné avec pochette.
- 📜 **Intégration du texte** : Inclusion automatique du texte des chapitres dans les métadonnées (Lyrics) et export d'un transcript `.txt`.
- 🖼️ **Pochette robuste** : Amélioration de l'extraction des couvertures EPUB (compatibilité EPUB 2/3).
- 🛠️ **Correctifs** : Correction du multiplexage FFmpeg pour une meilleure compatibilité

### v0.4.0
**Nouveautés majeures :**
- 🚀 **App Standalone** : FFmpeg et FFprobe sont maintenant intégrés dans l'exécutable.
- 🖼️ **Métadonnées complètes** : Les fichiers M4B incluent désormais la **pochette** du livre et le **chapitrage** automatique.
- ⏯️ **Pause & Reprise** : Possibilité de mettre en pause la conversion.
- 🔊 **Aperçu Vocal** : Bouton pour écouter la voix avant de lancer le traitement.
- 🧺 **Mode Batch** : Support du glisser-déposer de plusieurs fichiers simultanément.
- ⏱️ **Estimation affinée** : Calcul en temps réel du temps restant.

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
