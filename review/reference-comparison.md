# Comparaison visuelle à R01 et R02

Capture de la page statique après build, Chromium, langue `fr-FR`, mouvement réduit, polices locales chargées, images décodées, densité 1.

| Critère | État | Observation |
|---|---|---|
| Hero | Conforme avec écart documenté | Masse texte à gauche et produit dominant à droite, décor chantier et fondu clair conservés. Le casier 16 compartiments reste entier. Le H1 reprend les trois segments desktop. |
| Logo | Écart documenté | Silhouette LENDRR et accent visibles ; extraction raster de R02, pas de source vectorielle officielle. |
| Palette | Conforme | Anthracite, blanc cassé et orange réservés aux CTA et accents. |
| Typographie | Écart documenté | Inter et Space Grotesk locales ; Barlow Condensed approchée pour les titres étroits. |
| Grilles | Conforme, adaptée en tablette | Deux blocs dans la rangée produit/configuration ; rangée d'informations en trois colonnes desktop, deux colonnes et usages pleine largeur en tablette, une colonne sur mobile. |
| Densité | Conforme | Sections compactes, filets fins, alternance des zones claires et des bandeaux sombres. La longueur mobile suit le flux naturel. |
| Matières | Conforme | Rendu produit dédié, grain et bande orange lisibles dans la galerie. |
| Mobile | Conforme | Navigation repliée, hero réordonné, contenu lisible, grille d'usage adaptée. La comparaison conserve un défilement horizontal local. |

Captures pleine page :

- [Desktop 1122 px](screenshots/desktop-1122.png) — largeur native de R01 ; 1122 × 1867.
- [Desktop 1440 px](screenshots/desktop-1440.png) — 1440 × 1989.
- [Tablette 768 px](screenshots/tablet-768.png) — 768 × 2441.
- [Mobile 390 px](screenshots/mobile-390.png) — 390 × 4151.

Le rendu correspond à la structure et à la direction de R01, pas à une superposition pixel parfaite : le contenu a été reconstruit en HTML, les polices et certains assets originaux sont absents, et le produit de référence actuel a seize compartiments alors que R01 montre l'ancien modèle à six portes. Les captures sont des références de non-régression pour les prochaines modifications ; elles ne mesurent pas un pourcentage de fidélité.
