export type CabinetStoryChapter = {
  at: number;
  index: string;
  title: string;
  body: string;
};

export const cabinetStoryChapters: CabinetStoryChapter[] = [
  { at: 0, index: '01 · EMPRUNT', title: 'Le prêt est attribué.', body: 'L’accès par écran tactile ou application associe l’emprunt à un utilisateur et à un compartiment.' },
  { at: 0.17, index: '02 · RESTITUTION', title: 'Le dépôt clôt l’emprunt.', body: 'L’équipement retrouve son casier ; le système enregistre le retour sans geste supplémentaire de l’équipe.' },
  { at: 0.39, index: '03 · CONTRÔLE', title: 'Le retour est vérifié.', body: 'Le capteur confirme la présence ; l’IA analyse les images pour repérer l’état, la complétude et les dégradations.' },
  { at: 0.69, index: '04 · SUIVI', title: 'Une preuve horodatée.', body: 'L’historique relie l’équipement à son emprunteur, à l’heure du retour et aux images associées.' },
];

export function cabinetStoryChapter(progress: number): CabinetStoryChapter {
  return cabinetStoryChapters.reduce((current, chapter) => progress >= chapter.at ? chapter : current, cabinetStoryChapters[0]);
}
