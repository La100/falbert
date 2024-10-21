import Link from 'next/link';
import { models } from '@/utils/models';

export default function ModelsPage() {
  return (
    <div className="container max-w-4xl mx-auto p-5">
      <h1 className="text-4xl font-bold text-white mb-8">Dostępne Modele</h1>
      <ul className="space-y-4">
        {models.map((model) => (
          <li key={model.id} className="bg-zinc-700 p-4 rounded-lg">
            <h2 className="text-2xl font-semibold text-white">{model.name}</h2>
            <p className="text-zinc-300">{model.description}</p>
            <Link href={`/models/${model.id}`} className="text-blue-400 hover:underline">
              Przejdź do generowania
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
