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

1. **🎙️ Voix Neuronales Hyper-Réalistes & Mode Hors-ligne**  
   Oubliez les synthèses vocales robotiques. AudioLivreur utilise les algorithmes de pointe de *Microsoft Edge TTS* en ligne, ainsi que les modèles ultra-réalistes **Kokoro-TTS** et **Piper** fonctionnant **100% hors-ligne** directement depuis votre machine (sans envoi de données).
2. **⚡ Vitesse Foudroyante & Reprises Instantanées**  
   Générez un livre de 400 pages en quelques minutes grâce au traitement multi-threads parallèle (jusqu'à 20 processus). Si la génération s'interrompt, l'application reprend là où elle s'est arrêtée en une fraction de seconde grâce au cache intelligent.
3. **🔒 Traitement Local & Respect de la Vie Privée**  
   Vos livres restent chez vous ! L'extraction des textes, l'analyse des chapitres et la création des fichiers d'export (ZIP, M4B) sont réalisées **100% en local**. Aucun document original n'est envoyé sur le Cloud.
4. **📦 Exports Optimisés (MP3 / M4B avec Chapitres)**  
   Exportez vos livres au format classique **Archive ZIP (MP3 par chapitre)**, ou en fichier **M4B Unique** avec chapitrage intégré. Le serveur gère le transcodage AAC parallèle et le cache intelligent des pistes AAC pour une vitesse de fusion maximale.

---

## 🎯 Fonctionnalités Clés

- **Formats supportés** : `EPUB`, `PDF`, `DOCX`, `TXT`. Le texte et les chapitres sont extraits automatiquement.
- **Moteurs TTS locaux** : Intégration transparente de **Kokoro** (Qualité Studio) et **Piper** (Super-rapide sur CPU) pour une utilisation sans connexion internet.
- **Écoute progressive** : Écoutez chaque chapitre dès qu'il est terminé directement depuis la file d'attente de génération avec affichage du décompte de temps.
- **Fusion M4B avancée** : Choisissez entre le mode standard (Encodage AAC de haute compatibilité) et le mode ultra-rapide (Copie directe).
- **Support multilingue** : Interface et voix disponibles dans 10 langues traduites (Français, Anglais, Espagnol, Allemand, Italien, Portugais, Russe, Chinois, Japonais, Arabe).
- **Transitions immersives** : Ajoutez plus de 15 transitions sonores personnalisées (jingles, bol tibétain, page tournée, craquement de vinyle, etc.) ou du silence profond entre vos chapitres.
- **Métadonnées intégrées** : Couverture, Auteur, Titre et Numéro de chapitre sont injectés automatiquement dans les fichiers audio.
- **Design "Neubrutalist"** : Une interface utilisateur moderne, fluide et réactive.

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
