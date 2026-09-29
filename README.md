# LENDRR — site vitrine

> **V2 intégrée :** hero transparent, vue éclatée pilotée au scroll, application de démonstration dans le téléphone, formulaire de contact compact et proposition recentrée sur la vérification des retours.

Vitrine française statique pour le casier LENDRR à 16 compartiments. La proposition met en avant le parcours produit visé : associer l’emprunt à un utilisateur, vérifier la présence et l’état à la restitution, puis conserver une trace horodatée. Ce fonctionnement reste à valider en pilote ; la page ne prétend pas représenter un service déjà exploité. La composition suit R01, la marque suit R02, et les rendus du produit actuel prévalent sur l'ancien modèle à six portes visible dans certaines références. Voir [le positionnement produit](docs/product-positioning.md).

## Lancer et vérifier

Node `26.10.0` et npm sont les versions utilisées. Depuis ce dossier :

```sh
npm ci
npm run dev
```

Le serveur de développement s’ouvre sur `http://localhost:4321`. Faites défiler la section « Vue du produit » : le casier se décompose à la descente et se réassemble à la remontée, y compris dans une fenêtre basse. Si le navigateur demande de réduire les mouvements ou d’économiser les données, un bouton permet d’activer explicitement la séquence.

Le preview de production utilise un port distinct : `npm run build && npm run preview`, puis `http://localhost:4323`. Pour vérifier la séquence directement sur le serveur de développement : `LENDRR_DEV=1 npx playwright test tests/cabinet-story.spec.ts`.

## Docker et Coolify

L’image est construite en deux étapes : Astro génère les fichiers statiques, puis Nginx les sert sur le port `80`. Depuis Coolify, connecter ce dépôt Git et choisir le build pack **Dockerfile**. Régler le **Base Directory** sur `/site`, le **Dockerfile Location** sur `/Dockerfile` et le port exposé sur `80`. Coolify utilise le chemin du Dockerfile relatif au répertoire de base.

Pour une adresse de réception du formulaire, définir `PUBLIC_CONTACT_EMAIL` comme argument de build Docker dans Coolify. Cette valeur devient publique dans le site compilé ; ne jamais y placer un secret. Laisser le champ vide conserve le récapitulatif téléchargeable.

Tester localement avec `docker build -t lendrr-site ./site` puis `docker run --rm -p 8080:80 lendrr-site`, et ouvrir `http://localhost:8080`. La route `/health` sert au contrôle de santé du conteneur.

Les commandes de contrôle sont `npm run check`, `npm run build`, `npm run test:e2e` et `npm run test:visual`. `npm run test:visual:update` régénère les références Chromium après examen visuel. Le site est généré dans `dist/`.

La page ne requiert aucun service externe. Le formulaire prépare un e-mail si `PUBLIC_CONTACT_EMAIL` est renseigné au build ; sinon il propose un récapitulatif local téléchargeable. Aucun envoi automatique n’est effectué. Le site ne pilote aucun équipement et ne contrôle aucun casier réel. La vue éclatée utilise une séquence d’images WebP générée depuis le `.blend`, avec un manifeste statique. Voir [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md), [le dossier V2](../docs/lendrr-site/v2/README.md), [la carte des assets](asset-map.json) et les [écarts visuels historiques](review/differences.md).

## Périmètre

Le VPS, Docker Compose, le reverse proxy, le DNS, le TLS, le backend, l'authentification, les intégrations et les fonctions réelles de gestion des équipements restent hors périmètre. Le projet produit uniquement des fichiers statiques.

## Adresse de contact

Renseigner `PUBLIC_CONTACT_EMAIL` dans `.env` avant le build (voir `.env.example`). Le destinataire doit être confirmé par LENDRR. Sans cette adresse, le formulaire reste utilisable pour télécharger la demande, mais ne prétend pas l’envoyer. Les coordonnées saisies ne sont ni stockées ni transmises par le site.
