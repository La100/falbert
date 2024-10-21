export interface Model {
  id: string; // Przyjazny dla URL identyfikator
  name: string;
  description: string;
  replicateId: string; // Pełny identyfikator modelu dla Replicate
}

export const models: Model[] = [
  {
    id: 'flux-schnell',
    replicateId: 'black-forest-labs/flux-schnell',
    name: 'Flux Schnell',
    description: 'Szybki model generujący obrazy.',
  },
  {
    id: 'flux-pro',
    replicateId: 'black-forest-labs/flux-pro',
    name: 'Flux Pro',
    description: 'Profesjonalny model generujący obrazy o wysokiej jakości.',
  },
  {
    id: 'flux-dev',
    replicateId: 'black-forest-labs/flux-dev',
    name: 'Flux Dev',
    description: 'Eksperymentalny model generujący obrazy.',
  },
];
