import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { models, Model } from '@/utils/models';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Inicjalizacja klienta Supabase
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);



// Zaktualizowana funkcja getImageDimensions
const getImageDimensions = (imageSize: string) => {
  switch (imageSize) {
    case 'square':
      return { width: 1024, height: 1024 };
    case 'portrait':
      return { width: 1536, height: 2752 };
    case 'landscape':
      return { width: 2752, height: 1536 };
    default:
      return { width: 1536, height: 1536 }; // domyślnie kwadrat
  }
};

async function uploadImageToSupabase(imageUrl: string, userId: string) {
  try {
    // Pobierz obraz z URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error('Nie udało się pobrać obrazu');
    }
    const imageBlob = await response.blob();

    // Generuj unikalną nazwę pliku zachowując strukturę z folderem "generated"
    const fileName = `generated/${userId}/${Date.now()}.png`;

    // Zapisz w Supabase Storage
    const { data, error } = await supabase.storage
      .from('bucket')
      .upload(fileName, imageBlob, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Błąd uploadu:', error);
      return imageUrl;
    }

    // Pobierz publiczny URL w prawidłowy sposób
    const { data: imgUrl } = await supabase.storage
      .from('bucket')
      .getPublicUrl(fileName);

    return imgUrl.publicUrl;
  } catch (error) {
    console.error('Błąd podczas zapisywania obrazu:', error);
    return imageUrl;
  }
}

async function getUserId(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Błąd autoryzacji:', error);
      throw error;
    }
    
    if (!user?.id) {
      throw new Error('Nie znaleziono ID użytkownika');
    }
    
    return user.id;
  } catch (error) {
    console.error('Błąd podczas pobierania ID użytkownika:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, model, imageSize, referenceImage } = body;
    
    // Pobierz ID użytkownika z sesji
    const userId = await getUserId(request);

    if (!model || typeof model !== 'string') {
      throw new Error("Model nie został podany lub jest nieprawidłowy.");
    }

    // Najpierw sprawdź modele statyczne
    let selectedModel = models.find((m) => m.id === model);
    
    // Jeśli nie znaleziono modelu statycznego, sprawdź w bazie danych
    if (!selectedModel) {
      const { data: customModel } = await supabase
        .from('user_models')
        .select('*')
        .eq('url_id', model)
        .single();

      if (!customModel) {
        throw new Error("Wybrany model nie istnieje.");
      }

      selectedModel = {
        id: customModel.url_id,
        name: customModel.name,
        falId: customModel.fal_id,
        isCustom: true,
        loraPath: customModel.lora_path,
        description: customModel.description || '',
        image: customModel.image || ''
      } as Model;
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
  } catch (error: any) {
    console.error('Błąd podczas przetwarzania żądania:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas przetwarzania żądania' },
      { status: 500 }
    );
  }
}

