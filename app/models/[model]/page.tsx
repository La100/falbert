import { notFound } from 'next/navigation';
import Generate from '@/components/generate';
import { models, Model } from '@/utils/models';
import { Metadata } from 'next';

interface Params {
  params: {
    model: string;
  };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const model = models.find((m) => m.id === params.model);
  if (!model) {
    return {
      title: 'Model nie znaleziony',
      description: 'Wybrany model nie istnieje.',
    };
  }

  return {
    title: `Generowanie z ${model.name}`,
    description: model.description,
  };
}

export default function ModelPage({ params }: Params) {
  const model: Model | undefined = models.find((m) => m.id === params.model);

  if (!model) {
    notFound();
  }

  return (
    <div className="container max-w-2xl mx-auto p-5">
      <h1 className="py-8 text-center font-bold text-3xl text-white">
        Generuj obrazy z {model.name}
      </h1>
      <Generate modelId={model.id} />
    </div>
  );
}