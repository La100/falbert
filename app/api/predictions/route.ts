import { NextResponse } from "next/server";
import Replicate from "replicate";
import { models } from '@/utils/models';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: Request) {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error(
      'The REPLICATE_API_TOKEN environment variable is not set. See README.md for instructions on how to set it.'
    );
  }

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

  try {
    const prediction = await replicate.predictions.create({
      version: selectedModel.replicateId,
      input: { prompt }
    });

    return NextResponse.json(prediction);
  } catch (error: any) {
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
}
