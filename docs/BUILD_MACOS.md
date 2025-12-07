# Guide de compilation pour macOS

Ce guide vous explique comment préparer et compiler **AudioLivreur** sur un Mac.

## 1. Pré-requis

Vous devez avoir installé :
*   **Python 3.10+** : [Télécharger Python](https://www.python.org/downloads/macos/)
*   **FFmpeg** : Requis pour la fusion audio.
    *   Le plus simple est via Homebrew :
        ```bash
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        brew install ffmpeg
        ```

## 2. Installation des dépendances

Ouvrez le Terminal, naviguez vers le dossier du projet, et lancez :

```bash
cd /chemin/vers/CalibAudioStandalone/AudioLivreur
pip3 install -r requirements.txt
```

## 3. Compilation de l'application

Pour créer le fichier `.app` (application macOS), utilisez PyInstaller. Pour garder le dossier propre, nous générons les fichiers dans le dossier parent :

```bash
pyinstaller --distpath ../dist --workpath ../build build.spec
```

## 4. Lancer l'application

1.  Une fois la compilation terminée, allez dans le dossier `../dist` (un niveau au-dessus).
2.  Vous y trouverez `AudioLivreur.app`.
3.  Vous pouvez le lancer directement.

> [!NOTE]
> Si vous rencontrez une erreur de sécurité ("Développeur non identifié"), faites **Clic droit > Ouvrir** puis confirmez l'ouverture, ou allez dans *Réglages Système > Confidentialité et sécurité*.

## 5. Dépannage

*   **Problème d'affichage** : Si Tkinter/CustomTkinter pose problème, assurez-vous d'avoir installé `python-tk` : `brew install python-tk`.
*   **Icône** : Pour avoir une icône parfaite sur Mac, il est préférable de convertir `app_icon.png` en `app_icon.icns` et de mettre à jour le fichier `build.spec` si nécessaire, bien que PyInstaller gère souvent les png.

## 6. Créer un fichier DMG (Optionnel)

Par défaut, la compilation produit une application `.app`. Pour la distribuer proprement, vous pouvez créer une image disque `.dmg`.
L'outil le plus simple est `create-dmg` (à installer via brew : `brew install create-dmg`).

Commande pour créer le DMG :
```bash
create-dmg \
  --volname "AudioLivreur Installer" \
  --window-pos 200 120 \
  --window-size 800 400 \
  --icon-size 100 \
  --icon "AudioLivreur.app" 200 190 \
  --hide-extension "AudioLivreur.app" \
  --app-drop-link 600 185 \
  "AudioLivreur_Installer.dmg" \
  "dist/AudioLivreur.app"
```
