# Passe finale — direction visuelle et motion

Passe effectuée après intégration, avec les critères `design-taste-frontend`,
`gpt-taste` et `ui-animation`, en respectant les références LENDRR et les choix
explicitement fixés pour cette V2.

## Décisions appliquées

- **Hero produit** : caméra dédiée proche de la référence fournie, casier cadré
  en trois-quarts frontal avec son flanc visible. Le PNG Blender garde son alpha ;
  l’asset WebP intégré (1600 × 1400) conserve aussi la transparence. Le visuel
  s’intègre au fond papier du site sans encart ni scène de chantier.
- **Cadrage hero ajusté** : à la demande de l’utilisateur, l’échelle orthographique
  a été éloignée d’environ 13 % sans modifier l’angle ni la géométrie. Le casier
  respire davantage dans la composition. Nouveau PNG et WebP alpha vérifiés.
- **Vue éclatée** : inspection des limites alpha a montré que les canvases
  maîtres contenaient trop de vide autour du produit. Les exports WebP ont été
  recadrés selon l’emprise réellement rendue, sans redimensionner ni couper le
  casier : carré 1200 × 1200 sur desktop et portrait 834 × 960 sur mobile.
- **Fidélité des proportions** : le canvas calcule son buffer avec un facteur
  d’échelle commun aux deux axes. Il conserve ainsi la proportion du rendu CSS
  et ne déforme pas le produit quand le DPR ou la taille du viewport change.
- **Hiérarchie et rythme** : le hero garde une composition éditoriale asymétrique
  texte/produit ; les sections produit et configurations sont empilées. Les titres
  restent courts, les descriptions à largeur mesurée, et l’accent orange sert aux
  appels et aux repères techniques.
- **Motion** : la progression est liée à la position de scroll, sans lecture
  automatique. La vue assemblée s’ouvre progressivement, la dernière pose reste
  éclatée en bas, et le scroll inverse réassemble le casier. Le canvas est décoratif
  pour les technologies d’assistance ; une séquence statique reste disponible en
  mode mouvement réduit ou si l’animation ne s’initialise pas.
- **Périmètre** : pas de modèle manipulable, de contrôle de caméra, de décor,
  d’humain, de GSAP ajouté ou d’ornement animé indépendant du scroll. Ces choix
  maintiennent le rendu industriel, déterministe et fidèle à la demande.

## Vérification visuelle et technique

Captures Chromium : `hero-1440.png`, `scroll-desktop-{closed,middle,exploded}.png`
et `scroll-mobile-{closed,middle,exploded}.png`. Les vues d’extrémité et
intermédiaire montrent que toutes les pièces restent dans le cadre et que le
produit grossit utilement après recadrage.

La revue responsive sur 320, 390, 768, 1024, 1440, 1920 et 2560 px ne montre pas
de débordement horizontal. Aucun `pageerror` n’a été observé. Les tests E2E
couvrent le scrub desktop continu, le trajet mobile aller-retour, le mouvement
réduit, les interactions, les largeurs et les captures visuelles.

## Révision application et contact

La correction du téléphone place l’interface HTML au-dessus du fond noir opaque
présent dans son PNG. Le vrai rendu du casier remplace le schéma CSS ; logo,
statut vert, commande circulaire orange et navigation reproduisent la composition
de la référence sans personne ni main. La commande simule le verrouillage ; les
onglets Accès/Activité fonctionnent au clavier. Le journal utilise un conteneur
arrondi de 28 px, une surface intérieure de 16 px et des badges d’événement.

La section des configurations modulaires est remplacée à la demande de
l’utilisateur par le formulaire « Préparer ma configuration ». Les ancres
`#solutions` et `#configurer` restent utilisables. Champs nom, entreprise, e-mail,
type de site, nombre d’ensembles et message ; validation native, libellés visibles,
champs à 14 px d’arrondi, panneau à 32 px et bouton arrondi. Sans adresse de
réception confirmée, la demande est téléchargée localement ; définir
`PUBLIC_CONTACT_EMAIL` au build active l’ouverture d’un e-mail prérempli.

Captures : `digital-rounded-{1440,390}.png`, `contact-rounded-{1440,390}.png`.
Tests de régression : l’interface reçoit bien les clics au-dessus de l’image du
téléphone, les onglets et l’état de démonstration changent, les coordonnées et le
message sont conservés dans le récapitulatif et les champs requis sont validés.

## Positionnement produit et formulaire resserré

Lecture du dossier [Business case - Reformed](https://drive.google.com/drive/folders/12WgtmaWEgnb5THsflml3dYJ5wZNFxSq9) : la valeur qui différencie LENDRR est la vérification de la présence et de l’état à la restitution, puis la trace horodatée. La page parle désormais de ce parcours cible, sans chiffrer les économies, promettre un ROI ou suggérer que le casier est déjà connecté. Le risque juridique reste un bénéfice de protection et non une économie calculée.

Le formulaire est environ 15 % moins haut grâce à des champs, intervalles et marges plus compacts, tout en conservant les libellés, états de focus et cible tactile. Capture native contrôlée à 1440 px et 390 px : `contact-compact-{1440,390}.png`. Le panneau reste respirant sur mobile ; les deux colonnes desktop ne se resserrent pas au point de dégrader la saisie.

Les captures pleine page Chromium ont été régénérées après le changement éditorial. `npm run check`, `npm run build` et les 18 tests E2E passent ; les 6 largeurs responsive n’ont pas de débordement horizontal. Les 4 captures de référence passent après mise à jour intentionnelle.

## Rythme de page, animation et capacités

Le formulaire avait raccourci sa section de 150 à 200 px et remontait les blocs qui suivaient. La hauteur de section est maintenant réservée selon la largeur d’écran. Une courte ligne sous le formulaire indique les indicateurs qu’un pilote évaluera, afin de garder un rythme naturel sans étirer le formulaire. Captures contrôlées : `contact-rhythm-{1440,390}.png`.

Les libellés pilotés par le scroll décrivent désormais le prêt associé à un utilisateur, le dépôt qui clôt l’emprunt, le contrôle de présence et l’analyse des images, puis l’historique horodaté. La version statique accessible raconte le même chemin.

La table générique de caractéristiques est remplacée par un schéma lisible de l’ensemble réel : 12 compartiments compacts (3 × 4), 4 portes toute hauteur, 2 400 × 600 × 1 980 mm par ensemble, acier galvanisé thermolaqué, écran tactile et lecteur NFC. Les captures `capacity-{1440,390}.png` ont été vérifiées pour la densité, la lisibilité et l’absence de débordement.

## Logo, encadré et presse — 29 septembre 2026

Logo d’en-tête aligné à droite dans la même marge fluide à toutes les largeurs ; ordre de navigation cohérent dans le DOM. Bloc « Des outils mieux gérés » détaché, fond anthracite, marges beige sur quatre côtés et typographie compacte suivant la référence fournie. Correction de la portée des styles Astro du titre et du bouton d’en-tête.

Page /presse/ : composition éditoriale, ligne de lecture limitée, hiérarchie sobre, sources métier et hypothèse chiffrée distinguées des résultats du produit. Relecture selon les principes taste du projet : contraste, marges, typographie et absence de débordement. Captures comparison-box-1440.png et press-390.png inspectées ; contrôle de largeur de la page presse à 320, 390, 768 et 1440 px. Recherche et calcul documentés dans docs/press-editorial.md.
