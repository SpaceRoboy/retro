# ClimbSketch Android — génération de l’APK

Ce projet contient l’application web ClimbSketch empaquetée dans une application Android WebView.
L’APK n’est pas compilé dans cet environnement : il n’y a pas de SDK Android/outil de compilation installé et l’accès réseau nécessaire au téléchargement du SDK est indisponible. Le workflow GitHub Actions fourni compile l’APK dans un environnement Android prêt à l’emploi.

## Générer l’APK avec GitHub Actions

1. Crée un dépôt GitHub vide nommé `ClimbSketch`.
2. Décompresse cette archive et envoie **tout le contenu** du dossier dans le dépôt (la structure `.github/workflows/` doit être conservée).
3. Dans GitHub, ouvre l’onglet **Actions**.
4. Sélectionne **Build ClimbSketch APK**, puis **Run workflow**.
5. À la fin du workflow, ouvre son exécution réussie et télécharge l’artefact **ClimbSketch-debug-apk**.
6. Décompresse l’artefact : `app-debug.apk` est le fichier à installer sur Android.

Pour l’installer, transfère `app-debug.apk` sur le téléphone et autorise l’installation depuis cette source si Android le demande. C’est un APK de test/debug, non signé pour une distribution publique sur le Play Store.

## Fonctionnalités incluses
- Application web intégrée localement à l’APK, utilisable hors ligne.
- Sélection d’une photo de mur et import de fichiers JSON/ZIP.
- Export PNG, JSON et ZIP vers Téléchargements/ClimbSketch.
- Les données restent stockées localement sur le téléphone.

## Vérifications
Le projet n’a pas été compilé ni testé sur un appareil Android dans cet environnement. Le workflow compile l’APK et permet de récupérer le résultat ; un test réel sur téléphone reste nécessaire, notamment pour le sélecteur de fichiers et les exports.
