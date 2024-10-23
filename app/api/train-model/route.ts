import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { createClient } from '@supabase/supabase-js';

// Inicjalizacja klienta Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const config = {
  runtime: 'nodejs',
};

export async function POST(req: NextRequest) {
  console.log('Otrzymano żądanie POST');

  try {
    const formData = await req.formData();
    const zipFile = formData.get('zipFile') as File;
    const modelName = formData.get('modelName') as string;
    const selectedType = formData.get('selectedType') as string;

    // Dodaj walidację danych wejściowych
    if (!modelName || !selectedType || !zipFile) {
      return NextResponse.json({ 
        success: false, 
        error: 'Brakujące dane wejściowe'
      }, { status: 400 });
    }

    // Dodaj sprawdzenie rozmiaru pliku
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    if (zipFile.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        success: false, 
        error: 'Plik jest zbyt duży'
      }, { status: 400 });
    }

    console.log('Pola formularza:', { modelName, selectedType });
    console.log('Plik:', zipFile.name, zipFile.size, zipFile.type);

    console.log('Przygotowanie do przesłania pliku ZIP');
    const fileBuffer = await zipFile.arrayBuffer();
    console.log('Plik ZIP odczytany, rozmiar:', fileBuffer.byteLength);

    console.log('Przesyłanie pliku do fal.ai');
    const uploadedFile = await fal.storage.upload(new Uint8Array(fileBuffer), {
      contentType: 'application/zip',
      mimeType: 'application/zip'
    });

    // Ustaw trigger_word w zależności od typu
    const trigger_word = selectedType === 'Styl' ? modelName.toLowerCase() : modelName.split(' ')[0].toLowerCase();

    console.log('Rozpoczęcie trenowania modelu');
    const result = await fal.subscribe("fal-ai/flux-lora-fast-training", {
      input: {
        images_data_url: uploadedFile,
        create_masks: true,
        iter_multiplier: 1,
        steps: 1,
        trigger_word: trigger_word,
        data_archive_format: "zip",
        is_style: selectedType === 'Styl' // true dla typu 'Styl', false dla innych
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log('Odpowiedź z fal.ai:', result.data);

    // Pobierz ID zalogowanego użytkownika z nagłówka autoryzacji
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Brak autoryzacji');
    }
    const token = authHeader.replace('Bearer ', '');
    
    // Pobierz dane użytkownika
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      throw new Error('Nie można zweryfikować użytkownika');
    }

    // Generuj przyjazny URL ID
    const urlId = modelName.toLowerCase().replace(/\s+/g, '-');

    // Zapisz model w bazie danych
    const { data: modelData, error: modelError } = await supabase
      .from('user_models')
      .insert([
        {
          user_id: user.id,
          url_id: urlId,
          name: modelName,
          fal_id: 'fal-ai/flux-lora-fast-training', // Stała wartość dla wszystkich modeli trenowanych
          supports_file_upload: false,
          is_custom: true,
          lora_path: result.data.lora_path,
          trigger_word: trigger_word  // Zapisujemy pierwsze słowo
        }
      ])
      .select();

    if (modelError) {
      throw new Error(`Błąd podczas zapisywania modelu: ${modelError.message}`);
    }

    console.log('Model zapisany w bazie danych:', modelData);
    return NextResponse.json({ 
      success: true, 
      modelName,
      selectedType,
      result: result.data,
      modelData
    });
  } catch (error: any) {
    console.error('Błąd podczas przetwarzania żądania:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Wystąpił błąd podczas przetwarzania żądania',
      details: error.details || error
    }, { status: 500 });
  }
}
