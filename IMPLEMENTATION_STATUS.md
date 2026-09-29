# État d'implémentation LENDRR

## Correction de la séquence en développement

Suppression de la désactivation sous 600 px de hauteur ; composition compacte dans les fenêtres basses. Les préférences de mouvement réduit et d’économie de données proposent un bouton d’activation explicite. Un échec de chargement expose un message et une nouvelle tentative. Le manifeste est revalidé au chargement.

`npm run dev` utilise 4321 ; le preview utilise 4323. Six tests de séquence passent contre le serveur de développement, dont une comparaison des pixels du canvas fermé / milieu / éclaté / refermé sur bureau et en paysage.


## Révision application et contact

Interface HTML corrigée dans le téléphone (superposition au-dessus de son écran
opaque), vrai rendu produit, commande de démonstration et journal arrondi.
Le formulaire de contact remplace la grille des configurations modulaires ;
les ancres de navigation sont conservées. Adresse de réception à confirmer via
`PUBLIC_CONTACT_EMAIL` ; téléchargement local de la demande disponible en attendant.

Le formulaire a été resserré (marges, interlignes, champs et zone de message).
Après lecture du dossier `IPV6-Drive / IoT / Lendr / Business case - Reformed`,
la promesse centrale est désormais la vérification du retour : emprunt associé
à un utilisateur, état et présence documentés au retour, preuve horodatée. Le
texte sépare le parcours produit visé de la maquette actuelle. Les chiffres ROI
ne sont pas présentés comme des garanties ; les hypothèses sensibles du modèle
restent à valider sur le terrain. Voir [le cadrage](docs/product-positioning.md).

Passe design/taste finale : le formulaire compact garde l’emprise verticale de
la section et ne remonte plus les sections suivantes. Une ligne explique les
mesures proposées au pilote. L’animation raconte le parcours emprunt → retour →
analyse par capteur et IA → historique horodaté. Les capacités reprennent le
plan réel (12 casiers compacts et 4 portes toute hauteur) et les dimensions du
modèle courant. Captures natives bureau/mobile revues. Vérification actuelle :
`npm run check`, `npm run build` et les tests E2E passent, y compris le contrôle
des textes de l’animation et de l’espace réservé autour du formulaire.

## V2 — mise en œuvre

La page, son design system, les composants, quatre visuels d’usage sans personne,
le téléphone détouré et le hero du casier sont intégrés. Le casier canonique est
rendu en images Blender transparentes et sa séquence est pilotée par le scroll :
elle s’ouvre pendant la descente, tient sa vue éclatée à la fin, puis se réassemble
quand on remonte. Le modèle maître `lendrr/LENDRR_16_Chantier.blend` reste
inchangé ; sa copie dérivée est `lendrr/derived/LENDRR_Web_Exploded.blend`.

**Vérifié :** séquence desktop/mobile, manifeste et exports WebP (202 positions,
119 images de séquence uniques, ensemble des médias référencés autour de 3,97 Mio), scroll continu desktop, aller-retour
mobile, absence d’erreur JavaScript et aucune barre horizontale à 390 px.
`npm run check` (29 fichiers sans erreur/avertissement), `npm run build` et les
18 tests E2E passent.
Aucun hébergement ni Docker n’entre dans le périmètre. Le preview local est
accessible sur `http://127.0.0.1:4321/#produit` tant que son serveur tourne.

## Référence de la V1 historique

**Statut :** site implémenté et contrôlé visuellement le 28 septembre 2026. Le périmètre de la V1 dans `docs/lendrr-site/PLAN_IMPLEMENTATION.md` est réalisé ; le déploiement et le backend restent explicitement exclus.

**Socle :** Astro 7.3.5, TypeScript strict, Node 26.10.0, npm 12.1.0, CSS natif et polices locales Inter, Space Grotesk et Barlow Condensed. Un seul parcours produit, `current-16`.

**Contrôles passés :** `npm run check` (24 fichiers, aucune erreur ni hint), `npm run build`, `npm audit --omit=dev` (aucune vulnérabilité) et `npm run test:e2e` (14 tests passés : interaction, six largeurs responsives, quatre captures Chromium). Les captures de bureau, tablette et mobile ont été ouvertes et inspectées ; voir `review/screenshots/` et `review/reference-comparison.md`.

**Limites visuelles restantes :** logo extrait de la planche de marque et donc raster provisoire ; photos des cas d'usage extraites de petits montages ; police de bandeau approchée ; schémas de configuration et téléphone illustratifs. Les images du produit principal sont les rendus actuels et optimisés. Voir `asset-map.json` et `review/differences.md`.

Les conclusions V1 ci-dessus ne certifient pas la V2. Les sources historiques
restent archivées sous `lendrr/assets/site-v1/` pour comparaison ; les masters
Blender et les références d’origine sont conservés.
