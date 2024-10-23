import Generate from '@/components/generate';
import { models as staticModels } from '@/utils/models';
import { Metadata } from 'next';
import { getModelByUrlId } from '@/utils/supabase-server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface Params {
  params: {
    model: string;
  };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  try {
    // Sprawdź najpierw modele statyczne
    const staticModel = staticModels.find((m) => m.id === params.model);
    if (staticModel) {
      return {
        title: `Generowanie z ${staticModel.name}`,
        description: staticModel.description,
      };
    }

    // Jeśli nie znaleziono statycznego modelu, sprawdź w bazie danych
    const model = await getModelByUrlId(params.model);
    if (model) {
      return {
        title: `Generowanie z ${model.name}`,
        description: `Model użytkownika: ${model.name}`,
      };
    }

    return {
      title: 'Model nie znaleziony',
      description: 'Wybrany model nie istnieje.',
    };
  } catch (error) {
    console.error('Błąd podczas pobierania metadanych:', error);
    return {
      title: 'Błąd',
      description: 'Wystąpił błąd podczas ładowania modelu',
    };
  }
}

export default async function ModelPage({ params }: { params: { model: string } }) {
  try {
    // Inicjalizacja klienta Supabase
    const supabase = createServerComponentClient({ cookies });
    
    // Sprawdź najpierw modele statyczne
    const staticModel = staticModels.find((m) => m.id === params.model);
    if (staticModel) {
      return (
        <div>
          <h1 className='text-2xl font-bold text-center pt-8'>{staticModel.name}</h1>
          <p className='text-center'>{staticModel.description}</p>
          <Generate 
            modelId={staticModel.id} 
            supportsFileUpload={staticModel.supportsFileUpload ?? false} 
            triggerWord={staticModel.triggerWord}
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
        <Generate 
          modelId={model.fal_id} 
          supportsFileUpload={model.supports_file_upload} 
          loraPath={model.lora_path}
          trigger_word={model.trigger_word} // Zmiana z triggerWord na trigger_word
        />
      </div>
    );
  } catch (error) {
    console.error('Błąd podczas ładowania modelu:', error);
    return <div className="text-center p-8">Wystąpił błąd podczas ładowania modelu</div>;
  }
}
