import Image from 'next/image';
import { useState } from 'react';

interface PromptTemplate {
  id: string;
  name: string;
  image: string;
  prompt: string;
}

// Funkcja pomocnicza do wstawiania trigger_word do promptu
const insertTriggerWord = (prompt: string, trigger_word: string) => {
  return prompt.replace('{trigger_word}', trigger_word);
};

const promptTemplates: PromptTemplate[] = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    image: '/images/prompts/linkedin.jpg',
    prompt: 'Profesjonalne zdjęcie profilowe w stylu LinkedIn, {trigger_word} w garniturze, neutralne tło, oświetlenie studyjne'
  },
  {
    id: 'dream-style',
    name: 'Styl Marzenie',
    image: '/images/prompts/dream.jpg',
    prompt: 'Artystyczny portret w stylu marzycielskim, {trigger_word}, miękkie światło, pastelowe kolory'
  },
  {
    id: 'watercolor',
    name: 'Akwarela',
    image: '/images/prompts/watercolor.jpg',
    prompt: 'Portret w stylu akwarelowym, {trigger_word}, delikatne pociągnięcia pędzla, artystyczny wyraz'
  }
  // Dodaj więcej szablonów według potrzeb
];

interface PromptStartersProps {
  onSelectPrompt: (prompt: string) => void;
  trigger_word: string;
}

export default function PromptStarters({ onSelectPrompt, trigger_word }: PromptStartersProps) {
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  const handlePromptClick = (prompt: string) => {
    const finalPrompt = insertTriggerWord(prompt, trigger_word);
    setSelectedPrompt(finalPrompt);
    onSelectPrompt(finalPrompt);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
      {promptTemplates.map((template) => (
        <div
          key={template.id}
          className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
            selectedPrompt === insertTriggerWord(template.prompt, trigger_word)
              ? 'ring-2 ring-blue-500'
              : 'hover:opacity-80'
          }`}
          onClick={() => handlePromptClick(template.prompt)}
        >
          <div className="aspect-square relative">
            <Image
              src={template.image}
              alt={template.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
            <p className="text-white text-sm text-center">{template.name}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
