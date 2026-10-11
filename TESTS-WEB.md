# ClimbSketch — rapport de vérification (cycle en V)

Date de vérification : 11 octobre 2026.

## 1. Tests automatisés exécutés

Commande : `node --test tests/*.test.js`

Résultat : **12 tests réussis, 0 échec**.

| ID | Niveau | Test | Résultat |
|---|---|---|---|
| UT-01 | Unitaire | Limitation d'une valeur dans un intervalle | Réussi |
| UT-02 | Unitaire | Normalisation et bornage des coordonnées | Réussi |
| UT-03 | Unitaire | Reconstruction des coordonnées à une autre résolution | Réussi |
| UT-04 | Unitaire | Validation d'un projet valide | Réussi |
| UT-05 | Unitaire | Refus d'une version de format inconnue | Réussi |
| UT-06 | Unitaire | Refus des coordonnées et couleurs invalides | Réussi |
| UT-07 | Unitaire | Refus d'identifiants de blocs dupliqués | Réussi |
| UT-08 | Unitaire | Vérification CRC32 conforme | Réussi |
| UT-09 | Unitaire | Refus de dimensions d’image invalides | Réussi |
| UT-10 | Unitaire | Détection d’une archive ZIP corrompue | Réussi |
| IT-01 | Intégration | Création puis lecture d'une archive ZIP | Réussi |
| IT-02 | Intégration | Refus d'une archive ZIP invalide | Réussi |

## 2. Vérifications techniques supplémentaires exécutées

- `node --check app.js` : réussi.
- `node --check core.js` : réussi.
- Analyse syntaxique HTML avec le parseur Python standard : réussie.
- Archive ZIP générée par `createZip`, puis contrôlée par `unzip -t` : réussie, toutes les entrées sont lisibles.

## 3. Vérifications fonctionnelles à effectuer dans un navigateur réel

Ces scénarios sont définis mais **ne sont pas déclarés réussis**, car ils nécessitent une interaction réelle avec l'interface et/ou un appareil physique.

| ID | Scénario | Critère d'acceptation | Statut |
|---|---|---|---|
| SYS-01 | Importer une photo | Un mur et un premier bloc sont créés | À exécuter manuellement |
| SYS-02 | Ajouter plusieurs cercles | Chaque toucher crée un cercle à la position attendue | À exécuter manuellement |
| SYS-03 | Déplacer un cercle | Le cercle reste centré sur la prise après le geste | À exécuter manuellement |
| SYS-04 | Redimensionner un cercle | Le rayon évolue sans déplacer le centre | À exécuter manuellement |
| SYS-05 | Modifier style/couleur/type | Les valeurs sont affichées et sauvegardées | À exécuter manuellement |
| SYS-06 | Verrouiller une prise | Un glissement ne déplace pas la prise verrouillée | À exécuter manuellement |
| SYS-07 | Zoom et panoramique | Les cercles restent alignés sur les prises | À exécuter manuellement |
| SYS-08 | Annuler/rétablir | L'état précédent est restauré sans perte de la photo | À exécuter manuellement |
| SYS-09 | Fermer puis rouvrir | Le mur et les blocs sont toujours présents | À exécuter manuellement |
| SYS-10 | Export PNG | Le fichier contient la photo, les cercles et le libellé | À exécuter manuellement |
| SYS-11 | Export ZIP puis import | Les blocs importés restent modifiables et les coordonnées sont conservées | À exécuter manuellement |
| SYS-12 | Import d'un fichier invalide | L'import est refusé sans altérer la bibliothèque | À exécuter manuellement |
| SYS-13 | Recherche et collection | Les filtres donnent les résultats attendus | À exécuter manuellement |
| SYS-14 | Suppression d'un mur | Une confirmation est demandée et les données locales sont mises à jour | À exécuter manuellement |
| SYS-15 | PWA hors connexion | Après une première visite HTTPS, les fichiers de l'application sont servis du cache | À exécuter manuellement |
| REC-01 | Essai sur Android | Création et édition utilisables sur écran tactile | À exécuter sur appareil physique |
| REC-02 | Essai sur ordinateur | Édition souris/clavier et export utilisables | À exécuter sur navigateur desktop |

## 4. Points ouverts avant une version de production

1. Tester l'interface dans Chrome Android et au moins un navigateur desktop.
2. Ajouter un test de bout en bout automatisé dans un environnement navigateur disponible.
3. Ajouter une gestion d'historique plus fine : dans la version actuelle, certaines modifications continues par curseur peuvent produire plusieurs points d'annulation.
4. Ajouter la prise en charge des ZIP compressés standards, si l'import depuis d'autres outils devient requis.
5. Ajouter des limites explicites de taille d'image et des tests de restauration sur gros volumes.
6. Finaliser les fonctionnalités encore listées comme limites dans `README.md`.

## Conclusion

Les tests unitaires et les tests d'intégration portant sur la géométrie, la validation des données et le format ZIP passent. Cela ne suffit pas à déclarer l'application entièrement validée selon le cycle en V : les tests système et la recette physique restent à exécuter.
