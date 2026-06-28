<div align="center">
  <img src="https://img.icons8.com/?size=256&id=w5oD-3a21k0T&format=png" alt="AudioLivreur Logo" width="120">
  <h1>🎧 AudioLivreur</h1>
  <p><b>Le premier studio de synthèse vocale ultra-rapide et 100% privé.</b></p>
  <p>Transformez n'importe quel livre (EPUB, PDF, Word) en un livre audio immersif, propulsé par des voix neuronales de pointe.</p>

  <a href="#fonctionnalités"><strong>Explorer les fonctionnalités »</strong></a>
  <br>
  <br>

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Python](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://www.python.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-00a393.svg)](https://fastapi.tiangolo.com/)

</div>

---

## 🚀 Pourquoi choisir AudioLivreur ?

Vous avez des dizaines d'ebooks ou de documents PDF que vous n'avez pas le temps de lire ? **AudioLivreur** est conçu pour vous. Fini les voix robotiques insupportables et les services Cloud coûteux. Nous mettons la puissance des **voix neuronales** directement entre vos mains, avec une simplicité d'utilisation déconcertante.

### ✨ Les 4 Piliers d'AudioLivreur

1. **🎙️ Voix Neuronales Hyper-Réalistes**  
   Oubliez les synthèses vocales des années 2000. AudioLivreur utilise les algorithmes de pointe de *Microsoft Edge TTS* pour vous offrir des narrateurs qui respirent, intonnent et racontent avec émotion.
2. **⚡ Vitesse Foudroyante (Multi-Threads)**  
   Un livre de 400 pages ? Généré en quelques minutes ! Grâce au traitement multi-threads (jusqu'à 20 processus simultanés), exploitez toute la puissance de votre ordinateur. 
3. **🔒 Traitement Local & Respect de la Vie Privée**  
   Vos livres restent chez vous ! L'extraction des textes, l'analyse des chapitres et la création des fichiers d'export (ZIP, M4B) sont réalisées **100% en local sur votre machine**. Seules les requêtes de synthèse vocale sont transmises de manière sécurisée à l'API *Microsoft Azure (Edge TTS)* sans qu'aucun de vos documents originaux ne soit stocké sur un serveur tiers.
4. **📦 Un Fichier, Une Écoute**  
   Exportez vos livres au format classique **Archive ZIP (MP3 par chapitre)** pour une flexibilité maximale, ou en format **M4B Unique** pour l'importer directement dans votre application de livres audio préférée (Audible, Apple Books, Smart Audiobook Player).

---

## 🎯 Fonctionnalités Clés

- **Formats supportés** : `EPUB`, `PDF`, `DOCX`, `TXT`. Le texte et les chapitres sont extraits automatiquement.
- **Support multilingue** : Interface et voix disponibles dans plus de 15 langues (Français, Anglais, Espagnol, Japonais, Arabe, etc.)
- **Personnalisation fine** : Ajustez la vitesse de lecture et la hauteur de la voix en temps réel.
- **Transitions immersives** : Ajoutez des jingles ("Chime") ou des secondes de silence profond entre vos chapitres pour une véritable expérience "Studio".
- **Métadonnées intégrées** : Couverture, Auteur, Titre et Numéro de chapitre sont injectés automatiquement dans les fichiers audio.
- **Design "Neubrutalist"** : Une interface utilisateur percutante, moderne et intuitive.

---

## 🛠️ Installation Rapide

Pour commencer à écouter vos livres en quelques minutes :

### 1. Prérequis
- [Python 3.9+](https://www.python.org/downloads/)
- Optionnel : [FFmpeg](https://ffmpeg.org/download.html) (Recommandé pour certaines fonctionnalités de conversion)

### 2. Cloner et Installer
```bash
# Cloner le dépôt
git clone https://github.com/jul1n/AudioLivreur.git
cd AudioLivreur/dependance

# Installer les dépendances
pip install -r requirements.txt
```

### 3. Lancer le Studio
```bash
python server.py
```
Ouvrez ensuite votre navigateur préféré sur : **`http://localhost:8000`**

---

## 💡 Comment ça marche ?

1. **Glissez votre fichier** : Déposez votre EPUB, PDF ou DOCX directement dans l'interface.
2. **Faites vos réglages** : Choisissez la voix qui vous plaît (testez-la en direct !), réglez la vitesse et optez pour des transitions sonores.
3. **Lancez la magie** : Cliquez sur "Générer mon livre audio". Admirez la progression de vos chapitres et téléchargez votre archive !

---

## 🤝 Contribution & Open-Source

Imaginé et conçu par [Julien](https://github.com/jul1n). AudioLivreur est un projet Open-Source qui a pour vocation de rendre la culture et la lecture accessibles à tous, sans barrière technologique ni tarifaire.

N'hésitez pas à :
- Ouvrir une **Issue** si vous avez une idée géniale.
- Proposer une **Pull Request** pour améliorer le code.
- Laisser une **Étoile (⭐)** sur GitHub si ce projet vous a été utile !

---
<div align="center">
  <i>Propulsé par FastAPI, Edge TTS, JSZip, et de l'amour pour la lecture.</i>
</div>
