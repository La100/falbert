import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { models, Model } from '@/utils/models';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Inicjalizacja klienta Supabase
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

if (!process.env.FAL_KEY) {
  throw new Error(
    'Zmienna środowiskowa FAL_KEY nie jest ustawiona. Sprawdź plik README.md, aby uzyskać instrukcje, jak ją ustawić.'
  );
}

// Zaktualizowana funkcja getImageDimensions
const getImageDimensions = (imageSize: string) => {
  switch (imageSize) {
    case 'square':
      return { width: 1536, height: 1536 };
    case 'portrait':
      return { width: 1536, height: 2752 };
    case 'landscape':
      return { width: 2752, height: 1536 };
    default:
      return { width: 1536, height: 1536 }; // domyślnie kwadrat
  }
};

export async function POST(request: Request) {
  const { prompt, model, loraPath, isCustom, imageSize, referenceImage } = await request.json();

  if (!model || typeof model !== 'string') {
    return NextResponse.json(
      { detail: "Model nie został podany lub jest nieprawidłowy." },
      { status: 400 }
    );
  }

  // Najpierw sprawdź statyczne modele
  let selectedModel = models.find((m) => m.id === model);

  // Jeśli nie znaleziono w statycznych, sprawdź w bazie danych
  if (!selectedModel && isCustom) {
    const { data: userModel, error } = await supabase
      .from('user_models')
      .select('*')
      .eq('url_id', model)
      .single();

    if (error) {
      console.error('Błąd Supabase:', error);
      return NextResponse.json(
        { detail: "Błąd podczas wyszukiwania modelu." },
        { status: 500 }
      );
    }

    if (userModel) {
      selectedModel = {
        id: userModel.url_id,
        name: userModel.name,
        description: 'Model użytkownika',
        falId: 'fal-ai/flux-lora',
        image: '/images/models/custom-model.jpg',
        isCustom: true,
        loraPath: userModel.lora_path,
        triggerWord: userModel.trigger_word
        
      };
    }
  }

  if (!selectedModel) {
    return NextResponse.json(
      { detail: "Wybrany model nie istnieje." },
      { status: 400 }
    );
  }

  fal.config({
    credentials: process.env.FAL_KEY!,
  });

  try {
    let result;
    const dimensions = getImageDimensions(imageSize);

    if (selectedModel.isCustom) {
      console.log('Generowanie z modelem niestandardowym:', {
        loraPath: selectedModel.loraPath,
        prompt,
        image_size: dimensions
      });

      result = await fal.subscribe("fal-ai/flux-lora", {
        input: {
          prompt,
          lora_url: selectedModel.loraPath,
          num_images: 1,
          safety_checker: false,
          image_size: {
            width: dimensions.width,
            height: dimensions.height
          },
          loras: [{
            path: selectedModel.loraPath,
            scale: 1
          }]
        },
      });
    } else {
      result = await fal.subscribe(selectedModel.falId, {
        input: {
          prompt,
          num_images: 1,
          image_size: {
            width: dimensions.width,
            height: dimensions.height
          },
          image_url: referenceImage
        },
      });
    }
    const images = result.data.images;
    return NextResponse.json({ images });
  } catch (error: any) {
    console.error('Szczegóły błędu:', {
      message: error.message,
      status: error.status,
      body: error.body
    });
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
}

