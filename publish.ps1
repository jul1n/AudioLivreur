# Script de publication pour AudioLivreur
# Nécessite GitHub CLI (gh) installé : https://cli.github.com/

$VERSION = "0.8.4"
$REPO = "jul1n/AudioLivreur"

Write-Host "🚀 Préparation de la publication de la version v$VERSION..." -ForegroundColor Cyan

# Chemins des fichiers
$EXE_FULL = "dist/AudioLivreur-Full.exe"
$EXE_LIGHT = "dist/AudioLivreur.exe" # Version sans ffmpeg

# Vérification des fichiers
if (-not (Test-Path $EXE_FULL)) {
    Write-Host "❌ Erreur : $EXE_FULL introuvable. Lancez le build d'abord." -ForegroundColor Red
    exit
}

Write-Host "📦 Création de la Release sur GitHub..." -ForegroundColor Yellow
gh release create "v$VERSION" --title "AudioLivreur v$VERSION" --notes "### Nouveautés`n- Amélioration de la gestion des pochettes (format compatible VLC)`n- Métadonnées complètes (Titre, Auteur, Album)`n- Correction de l'interface (taille de fenêtre)`n- Archivage automatique des builds"

Write-Host "⬆️ Upload des exécutables..." -ForegroundColor Yellow
gh release upload "v$VERSION" "$EXE_FULL#AudioLivreur_v$VERSION_Full_Win.exe"
gh release upload "v$VERSION" "$EXE_LIGHT#AudioLivreur_v$VERSION_Light_Win.exe"

Write-Host "✅ Publication terminée ! Disponible sur : https://github.com/$REPO/releases/tag/v$VERSION" -ForegroundColor Green
