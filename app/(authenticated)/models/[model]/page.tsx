import Generate from '@/app/(authenticated)/components/generate';
import GenerateCustom from '@/app/(authenticated)/components/generateCustom';
import { models as staticModels } from '@/utils/models';
import { getModelByUrlId } from '@/utils/supabase-server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function ModelPage({ params }: { params: { model: string } }) {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  try {
    // Sprawdź najpierw modele statyczne
    const staticModel = staticModels.find((m) => m.id === params.model);
    if (staticModel) {
      return (
        <div>
          <h1 className='text-2xl font-bold text-center pt-8'>{staticModel.name}</h1>
          <p className='text-center'>{staticModel.description}</p>
          <Generate
            modelId={staticModel.id} 
          
            supportsImageInput={staticModel.supportsImageInput}
          />
        </div>
      );
    }

    // Jeśli nie znaleziono statycznego modelu, sprawdź w bazie danych
    const model = await getModelByUrlId(params.model);
    if (!model) {
      return <div className="text-center p-8">Model nie znaleziony</div>;
    }

    return (
      <div>
        <h1 className='text-2xl font-bold text-center pt-8'>{model.name}</h1>
        <p className='text-center'>Model użytkownika</p>
        <GenerateCustom 
          modelId={model.url_id}
          loraPath={model.lora_path}
          trigger_word={model.trigger_word}
        />
      </div>
    );
  } catch (error) {
    console.error('Błąd podczas ładowania modelu:', error);
    return <div className="text-center p-8">Wystąpił błąd podczas ładowania modelu</div>;
  }
}

