export interface Model {
  id: string; // Przyjazny dla URL identyfikator
  name: string;
  description: string;
  falId: string; // Pełny identyfikator modelu dla fal AI
  image: string; // Ścieżka do zdjęcia modelu
  isCustom?: boolean;
  loraPath?: string;
  supportsImageInput?: boolean; // nowe pole
}

export const models: Model[] = [
  {
    id: 'flux-dev',
    falId: 'fal-ai/flux/dev',
    name: 'Flux Dev',
    description: 'Eksperymentalny model generujący obrazy.',
    image: '/images/models/flux-dev.jpg',
 
  },
  {
    id: 'stable-diffusion-v35-large',
    falId: 'fal-ai/stable-diffusion-v35-large',
    name: 'Stable Diffusion v3.5 Large',
    description: 'Zaawansowany model generatywny Stable Diffusion.',
    image: 'https://fal.media/files/zebra/j7weO6D0P1Yhmg-wer12s.jpeg',
  },
  {
    id: 'flux-pro',
    falId: 'fal-ai/flux-pro/v1.1',
    name: 'Flux Pro',
    description: 'Advanced model ',
    image: '/images/models/flux-pro.jpg',
  },
  {
    id: 'flux-schnell',
    falId: 'fal-ai/flux/schnell',
    name: 'Flux Schnell',
    description: 'Szybki model generujący obrazy.',
    image: 'https://fal.media/files/elephant/uhXgpZkrztPKpHf6MOYVw_f780fab9d0104151a9e5ad877757b514.jpg',
  },
  {
    id: 'runway-gen3-turbo',
    falId: 'fal-ai/runway-gen3/turbo/image-to-video',
    name: 'Runway Gen3 Turbo',
    description: 'Model do konwersji obrazu na wideo.',
    image: '/images/models/runway-gen3-turbo.jpg',

  },
  {
    id: 'flux-pro-ultra',
    falId: 'fal-ai/flux-pro/v1.1-ultra',
    name: 'Flux Pro Ultra',
    description: 'Zaawansowany model generatywny o najwyższej jakości.',
    image: '/images/models/flux-pro-ultra.jpg',
  },


];
 

