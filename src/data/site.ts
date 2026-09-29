export const productVariant = 'current-16' as const;

export const navigation = [
  { label: 'Produits', href: '#produit' },
  { label: 'Solutions', href: '#solutions' },
  { label: "Cas d’usage", href: '#cas-usage' },
  { label: 'Presse', href: '/presse/' },
  { label: 'À propos', href: '#a-propos' },
] as const;

export const attributes = [
  { icon: 'cube', label: 'Traçable', detail: 'Un objet par compartiment' },
  { icon: 'shield', label: 'Vérifié', detail: 'État contrôlé au retour' },
  { icon: 'bars', label: 'Horodaté', detail: 'Une trace à chaque étape' },
  { icon: 'strength', label: 'Terrain', detail: 'Pensé pour les chantiers' },
] as const;

export const useCases = [
  { icon: 'drill', title: 'Outillage', detail: 'Perceuses, visseuses et outils électroportatifs' },
  { icon: 'helmet', title: 'EPI', detail: 'Casques, gants et protections' },
  { icon: 'shared', title: 'Matériel partagé', detail: 'Petits équipements et instruments de mesure' },
  { icon: 'box', title: 'Consommables', detail: 'Fixations, abrasifs et pièces courantes' },
] as const;

export const specificationRows = [
  ['Dimensions hors tout · 1 ensemble', '2 400 × 600 × 1 980 mm'],
  ['Structure', 'Acier galvanisé, finition thermolaquée'],
  ['Accès représenté', 'Écran tactile et lecteur NFC en façade'],
  ['Finition représentée', 'Anthracite et signature orange'],
] as const;

export const cabinetCapacities = [
  { count: 12, kind: 'compact', title: 'Compartiments compacts', detail: '3 colonnes × 4 niveaux' },
  { count: 4, kind: 'full-height', title: 'Compartiments toute hauteur', detail: 'Pour les outils longs' },
] as const;

export const digitalFeatures = [
  { icon: 'phone', title: 'Emprunt sur écran ou application', detail: 'Un accès conçu pour le terrain' },
  { icon: 'bars', title: 'Suivi des usages', detail: 'Qui a pris quoi, et quand' },
  { icon: 'bell', title: 'Retours à vérifier', detail: 'Présence, état et anomalies' },
  { icon: 'settings', title: 'Vue multi-sites', detail: 'Un suivi centralisé des équipements' },
] as const;

export const comparisonRows = [
  ['Emprunt', 'Associé à un utilisateur', 'Noté ou suivi séparément'],
  ['Restitution', 'Présence et état vérifiés', 'Contrôle visuel sur le terrain'],
  ['Anomalie', 'Signalée pour vérification', 'Dépend du signalement manuel'],
  ['Historique', 'Événements horodatés', 'Registre à reconstituer'],
] as const;

export const configurationOptions = [
  { value: '1', label: '1 ensemble' },
  { value: '2', label: '2 ensembles' },
  { value: '3', label: '3 ensembles' },
  { value: '4', label: '4 ensembles' },
] as const;

export const siteContent = {
  brandLine: 'Le suivi des équipements, jusqu’à leur état au retour',
  heroEyebrow: 'LENDRR · ÉQUIPEMENTS DE CHANTIER',
  heroTitle: 'Le casier qui vérifie chaque retour.',
  heroIntro:
    "Le projet LENDRR associe chaque emprunt à un utilisateur, puis documente la restitution : présence, état et preuve horodatée. Le contrôle se fait au retour, sans ajouter de geste à l’équipe.",
  ctaPrimary: 'Parler d’un pilote',
  ctaSecondary: 'Voir la vue éclatée',
  productDisclaimer: 'Caractéristiques du modèle de présentation.',
  productCaveat: 'Dimensions et capacité de plusieurs ensembles à confirmer selon votre besoin.',
  benefitHeading: 'La restitution devient une preuve.',
  finalHeading: 'Mesurons le parcours sur votre chantier.',
  about: 'LENDRR conçoit un casier connecté qui suit les équipements prêtés et vérifie leur état à la restitution.',
} as const;
