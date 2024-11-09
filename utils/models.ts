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
    image: 'https://utfs.io/f/ELvVtrJ8e2WsRgmUP5jrfdTV27GgZ8iEkY64WFjRpclruKNS',
 
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
    image: 'https://utfs.io/f/ELvVtrJ8e2WsBL8LmzfXldb9tG4FIhoDe5szV3M8c7R1Nrwf',
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
    image: 'https://utfs.io/f/ELvVtrJ8e2WsrhIZxP57mARzX6w8BkYads3tNM2ufLFQKZI5',
    supportsImageInput:true,

  },
  {
    id: 'flux-pro-ultra',
    falId: 'fal-ai/flux-pro/v1.1-ultra',
    name: 'Flux Pro Ultra',
    description: 'Zaawansowany model generatywny o najwyższej jakości.',
    image: 'https://utfs.io/f/ELvVtrJ8e2Ws6o35a8QFcZ72GdMHbjONrKTYenhQsX9Ry3aD',
  },
  {
    id: 'recraft-v3',
    falId: 'fal-ai/recraft-v3',
    name: 'Recraft v3',
    description: 'Model specjalizujący z tekstem.',
    image: 'https://utfs.io/f/ELvVtrJ8e2WsTU6rkmiacNQziZS9Mt62fFwqJYhB7GvReuP3',
  }


];
 

