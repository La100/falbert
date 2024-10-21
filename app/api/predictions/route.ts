import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { models } from '@/utils/models';

if (!process.env.FAL_KEY) {
  throw new Error(
    'Zmienna środowiskowa FAL_KEY nie jest ustawiona. Sprawdź plik README.md, aby uzyskać instrukcje, jak ją ustawić.'
  );
}

export async function POST(request: Request) {
  const { prompt, model }: { prompt: string; model: string } = await request.json();

  if (!model || typeof model !== 'string') {
    return NextResponse.json(
      { detail: "Model nie został podany lub jest nieprawidłowy." },
      { status: 400 }
    );
  }

  const selectedModel = models.find((m) => m.id === model);
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
    const result = await fal.subscribe(selectedModel.falId, {
      input: {
        prompt,
      },
    });

    const images = result.data.images;

    return NextResponse.json({ images });
  } catch (error: any) {
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
}
