export interface Model {
  id: string; // Przyjazny dla URL identyfikator
  name: string;
  description: string;
  falId: string; // Pełny identyfikator modelu dla fal AI
}

export const models: Model[] = [
  {
    id: 'flux-dev',
    falId: 'fal-ai/flux/dev',
    name: 'Flux Dev',
    description: 'Eksperymentalny model generujący obrazy.',
  },
  {
    id: 'flux-pro',
    falId: 'fal-ai/flux-pro/v1.1',
    name: 'Flux Pro',
    description: 'Zaawansowany model generujący obrazy w wysokiej jakości.',
  },
  {
    id: 'flux-schnell',
    falId: 'fal-ai/flux/schnell',
    name: 'Flux Schnell',
    description: 'Szybki model generujący obrazy.',
  },
  // Możesz dodać inne modele, jeśli są dostępne w fal AI
];

