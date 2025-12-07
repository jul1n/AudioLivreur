# AudioLivreur - Guide Utilisateur

**Version:** 0.3.1  
**Date:** 29 novembre 2025  
**Auteur:** Julien

---

## 📖 Table des Matières

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Configuration Initiale](#configuration-initiale)
4. [Utilisation](#utilisation)
5. [Paramètres Avancés](#paramètres-avancés)
6. [Dépannage](#dépannage)
7. [FAQ](#faq)

---

## 🎯 Introduction

**AudioLivreur** est un convertisseur d'ebooks en livres audio qui transforme vos fichiers EPUB, PDF, DOCX et autres formats en audiobooks M4B avec chapitres.

### Fonctionnalités Principales

✅ **Multi-formats** : EPUB, PDF, DOCX, TXT, MD, MOBI, AZW3  
✅ **Synthèse vocale** : Utilise Microsoft Edge TTS (gratuit)  
✅ **Chapitrage automatique** : Détection et marquage des chapitres  
✅ **Interface bilingue** : Français et Anglais  
✅ **Export MP3** : Option de sauvegarde des fichiers MP3 individuels  
✅ **Estimation du temps** : Affichage du temps de conversion estimé

---

## 💾 Installation

### Prérequis

1. **Windows 10/11** (64-bit)
2. **FFmpeg** (téléchargement automatique proposé)

### Installation de FFmpeg

AudioLivreur détecte automatiquement FFmpeg si installé dans :
- Le PATH système
- `C:\ffmpeg\bin\`
- `C:\Program Files\ffmpeg\bin\`
- `%USERPROFILE%\Downloads\ffmpeg\bin\`

#### Téléchargement FFmpeg

1. Cliquez sur le lien dans les paramètres ou visitez : https://github.com/BtbN/FFmpeg-Builds/releases
2. Téléchargez `ffmpeg-master-latest-win64-gpl.zip`
3. Extrayez dans `C:\ffmpeg\`
4. Redémarrez AudioLivreur

### Installation d'AudioLivreur

#### Version Exécutable (Recommandé)
1. Téléchargez `AudioLivreur.exe`
2. Double-cliquez pour lancer
3. Aucune installation requise !

#### Version Python (Développeurs)
```bash
# Cloner ou télécharger le projet
cd CalibAudioStandalone

# Installer les dépendances
pip install -r requirements.txt

# Lancer l'application
python gui.py
```

---

## ⚙️ Configuration Initiale

### Premier Lancement

1. **Lancez AudioLivreur**
2. **Vérifiez FFmpeg** :
   - Si FFmpeg n'est pas détecté, un message d'erreur apparaîtra
   - Cliquez sur ⚙️ **Paramètres** → **📂** pour sélectionner `ffmpeg.exe`
3. **Choisissez votre langue** :
   - Cliquez sur le drapeau 🇫🇷/🇬🇧 en haut à droite

### Configuration Recommandée

Ouvrez les **Paramètres** (⚙️) et configurez :

| Paramètre | Recommandation | Description |
|-----------|----------------|-------------|
| **Voix** | `fr-FR-VivienneMultilingualNeural` | Voix française naturelle |
| **Vitesse** | `+0%` à `+20%` | Augmentez pour lecture rapide |
| **Volume** | `+0%` | Ajustez si nécessaire |
| **FFmpeg** | Auto-détecté | Chemin vers ffmpeg.exe |
| **Sauvegarder MP3s** | ✅ Activé | Garde les fichiers MP3 |

---

## 🚀 Utilisation

### Conversion Simple

1. **Glissez-déposez** votre fichier dans la zone centrale
   - Ou cliquez sur la zone pour parcourir

2. **Analysez le fichier**
   - L'application affiche : Chapitres, Mots, Temps estimé
   - Exemple : `Chapitres : 15 | Mots : 45000 (~5h)`

3. **Démarrez la conversion**
   - Cliquez sur **Démarrer la Conversion**
   - Suivez la progression en temps réel

4. **Récupérez votre audiobook**
   - Le fichier M4B est créé dans le même dossier que le fichier source
   - Nom : `[Nom du livre].m4b`

### Formats Supportés

| Format | Extension | Notes |
|--------|-----------|-------|
| EPUB | `.epub` | ✅ Recommandé - Meilleure détection des chapitres |
| PDF | `.pdf` | ⚠️ Nécessite du texte (pas d'images scannées) |
| Word | `.docx` | ✅ Fonctionne bien |
| Texte | `.txt`, `.md` | ✅ Simple et rapide |
| Kindle | `.mobi`, `.azw3` | ✅ Supporté |

### Progression de la Conversion

L'interface affiche :
- **Barre de progression** : Visualisation en histogramme
- **Statut** : "TTS (3/15): Chapitre 3"
- **Compteur de mots** : "15000/45000 mots"
- **Texte en cours** : Aperçu du texte converti

### Annulation

- Cliquez sur **Annuler** pendant la conversion
- Les fichiers temporaires sont automatiquement nettoyés
- Aucun fichier M4B n'est créé

---

## 🎛️ Paramètres Avancés

### Voix TTS

AudioLivreur utilise Microsoft Edge TTS avec plus de 400 voix disponibles.

#### Voix Françaises Recommandées
- `fr-FR-VivienneMultilingualNeural` - Féminine, naturelle
- `fr-FR-RemyMultilingualNeural` - Masculine, naturelle
- `fr-FR-DeniseNeural` - Féminine, claire
- `fr-FR-HenriNeural` - Masculine, profonde

#### Voix Anglaises Recommandées
- `en-US-AriaNeural` - Féminine, américaine
- `en-US-GuyNeural` - Masculine, américaine
- `en-GB-SoniaNeural` - Féminine, britannique
- `en-GB-RyanNeural` - Masculine, britannique

### Ajustement de la Vitesse

| Valeur | Usage | Description |
|--------|-------|-------------|
| `-20%` | Apprentissage | Très lent, pour étudier |
| `+0%` | Normal | Vitesse de lecture naturelle |
| `+20%` | Rapide | Gain de temps sans perte de clarté |
| `+50%` | Très rapide | Pour lecteurs expérimentés |

> ⚠️ **Attention** : Au-delà de +50%, la voix peut devenir difficile à comprendre

### Sauvegarde des MP3

Lorsque activé, AudioLivreur crée un dossier `[Nom du livre]_MP3s` contenant :
- Un fichier MP3 par chapitre
- Nommage : `001_Chapitre_1.mp3`, `002_Chapitre_2.mp3`, etc.

**Utilité** :
- Écouter des chapitres individuels
- Partager des extraits
- Backup avant fusion

---

## 🔧 Dépannage

### Problèmes Courants

#### ❌ "FFmpeg not found"

**Cause** : FFmpeg n'est pas installé ou non détecté

**Solutions** :
1. Téléchargez FFmpeg via le lien dans les paramètres
2. Installez dans `C:\ffmpeg\`
3. Ou spécifiez manuellement le chemin dans Paramètres → FFmpeg Path

#### ❌ "No text could be extracted from the file"

**Cause** : Le fichier est vide ou contient uniquement des images

**Solutions** :
- **PDF** : Vérifiez que le PDF contient du texte (pas des scans)
- **EPUB** : Vérifiez que le fichier n'est pas corrompu
- Essayez de convertir le fichier dans un autre format

#### ❌ Conversion très lente

**Cause** : Fichier volumineux ou connexion internet lente

**Solutions** :
- Vérifiez l'estimation de temps affichée
- Edge TTS nécessite une connexion internet
- Patientez ou divisez le fichier en parties plus petites

#### ❌ "Error generating chapter"

**Cause** : Problème de connexion ou chapitre trop long

**Solutions** :
1. Vérifiez votre connexion internet
2. Réessayez la conversion
3. Si le problème persiste, le chapitre est peut-être trop long (>10000 mots)

#### ❌ Voix ne se charge pas

**Cause** : Pas de connexion internet ou serveur Microsoft indisponible

**Solutions** :
1. Vérifiez votre connexion internet
2. Redémarrez l'application
3. Les voix se chargent en arrière-plan, patientez quelques secondes

### Logs de Débogage

Les logs sont affichés dans la console (si lancé depuis Python) :
```
[DEBUG] Starting conversion process...
[DEBUG] File: C:\Users\...\livre.epub
[DEBUG] Extraction complete. Found 15 chapters.
[DEBUG] Total words to process: 45000
```

Pour obtenir de l'aide, copiez ces logs et contactez le support.

---

## ❓ FAQ

### Général

**Q : AudioLivreur est-il gratuit ?**  
R : Oui, complètement gratuit et open-source.

**Q : Ai-je besoin d'une connexion internet ?**  
R : Oui, pour la synthèse vocale (Edge TTS est un service en ligne).

**Q : Puis-je utiliser mes propres voix ?**  
R : Non, AudioLivreur utilise uniquement les voix Microsoft Edge TTS.

**Q : Les audiobooks sont-ils compatibles avec mon lecteur ?**  
R : Oui, le format M4B est compatible avec :
- Apple Books (iPhone, iPad, Mac)
- Audiobookshelf
- Plex
- La plupart des lecteurs d'audiobooks

### Technique

**Q : Quelle est la qualité audio ?**  
R : MP3 128 kbps (qualité standard pour la voix).

**Q : Puis-je convertir plusieurs livres en même temps ?**  
R : Non, une conversion à la fois. Lancez plusieurs instances pour du parallèle.

**Q : Combien d'espace disque nécessaire ?**  
R : Environ 1 MB par minute d'audio (ex: 10h = ~600 MB).

**Q : Les chapitres sont-ils détectés automatiquement ?**  
R : Oui pour EPUB. Pour les autres formats, le livre entier = 1 chapitre.

### Légal

**Q : Puis-je convertir des livres achetés ?**  
R : Oui, si vous possédez le livre et pour usage personnel uniquement.

**Q : Puis-je partager les audiobooks créés ?**  
R : Non, sauf si vous possédez les droits. Usage personnel uniquement.

---

## 📊 Exemples de Temps de Conversion

| Taille du livre | Mots | Chapitres | Temps estimé | Taille M4B |
|-----------------|------|-----------|--------------|------------|
| Petit roman | 50,000 | 10 | ~5h | ~300 MB |
| Roman moyen | 100,000 | 20 | ~11h | ~650 MB |
| Grand roman | 200,000 | 30 | ~22h | ~1.3 GB |
| Essai | 30,000 | 8 | ~3h | ~180 MB |

> 💡 **Astuce** : Lancez les conversions longues pendant la nuit !

---

## 🆘 Support

### Obtenir de l'Aide

1. **Vérifiez cette documentation**
2. **Consultez les logs** pour les messages d'erreur
3. **Contactez le support** avec :
   - Version d'AudioLivreur (0.3.1)
   - Message d'erreur complet
   - Type de fichier converti
   - Logs de débogage

### Signaler un Bug

Incluez :
- Description du problème
- Étapes pour reproduire
- Fichier de test (si possible)
- Logs complets

---

## 📝 Notes de Version

### Version 0.3.1 (2025-11-29)

**🐛 Corrections de bugs :**
- ✅ Correction de fuite de ressources (event loop)
- ✅ Auto-détection de FFmpeg
- ✅ Correction de la race condition de chargement des voix

**✨ Améliorations :**
- ✅ Estimation du temps de conversion
- ✅ Optimisation du comptage de mots
- ✅ Meilleurs messages d'erreur FFmpeg
- ✅ Versions des dépendances épinglées

**📚 Documentation :**
- ✅ Guide utilisateur complet
- ✅ Documentation technique
- ✅ Revue de code détaillée

---

## 🙏 Remerciements

- **Microsoft Edge TTS** pour la synthèse vocale gratuite
- **FFmpeg** pour le traitement audio
- **CustomTkinter** pour l'interface moderne

---

**AudioLivreur v0.3.1** - Transformez vos ebooks en audiobooks ! 🎧📚
