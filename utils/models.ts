export interface Model {
  id: string; // Przyjazny dla URL identyfikator
  name: string;
  description: string;
  falId: string; // Pełny identyfikator modelu dla fal AI
  image: string; // Ścieżka do zdjęcia modelu
  supportsFileUpload?: boolean; // Nowe pole
  isCustom?: boolean;
  loraPath?: string;
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
    supportsFileUpload: true, // Dodajemy obsługę przesyłania plików dla tego modelu
  },
  {
    id: 'fal-flux-lora-85d6ccf58d534175aa73f82116ab3854',
    falId: 'fal-ai/flux-lora',
    name: 'Model niestandardowy',
    description: 'Model wytrenowany przez użytkownika.',
    image: '/images/models/custom-model.jpg',
    isCustom: true,
    loraPath: 'https://storage.googleapis.com/fal-flux-lora/85d6ccf58d534175aa73f82116ab3854_pytorch_lora_weights.safetensors'
  },

];
 

