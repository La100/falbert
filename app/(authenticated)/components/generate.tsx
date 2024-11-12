'use client';

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Download } from 'lucide-react';

interface GenerateStaticProps {
  modelId: string;
  trigger_word?: string;
  supportsImageInput?: boolean;
}

interface GeneratedImage {
  url: string;
  originalUrl: string;
}

const downloadImage = async (imageUrl: string, filename: string) => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'generated-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Błąd podczas pobierania obrazu:', error);
  }
};

export default function GenerateStatic({ modelId, trigger_word, supportsImageInput }: GenerateStaticProps) {
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [wasTranslated, setWasTranslated] = useState<boolean>(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [imageSize, setImageSize] = useState<string>('square');

  const handleImageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setLogs([]);
    setImages([]);

    const prompt = (e.currentTarget.elements.namedItem('prompt') as HTMLInputElement).value;

    try {
      // Tłumaczenie promptu
      const translationResponse = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: prompt }),
      });

      if (!translationResponse.ok) {
        throw new Error("Błąd podczas tłumaczenia promptu");
      }

      const { translatedText, originalText, wasTranslated } = await translationResponse.json();
      setWasTranslated(wasTranslated);
      
      if (wasTranslated) {
        setLogs(prev => [
          `Oryginalny prompt: ${originalText}`, 
          `Przetłumaczony prompt: ${translatedText}`
        ]);
      }

      // Generowanie obrazu
      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: translatedText,
          model: modelId,
          imageSize,
          referenceImage
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Wystąpił błąd podczas generowania obrazu.");
      }

      const data = await response.json();
      setImages(data.images);

    } catch (err: any) {
      console.error('Błąd:', err);
      setError(err.message || "Wystąpił błąd podczas wysyłania żądania.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-secondary/30 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-secondary/50">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-center">
          Stwórz swoją wizję
        </h1>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
            <input
              type="text"
              className="w-full px-6 py-4 bg-secondary/40 border border-secondary/60 rounded-xl text-background-foreground placeholder-secondary-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition duration-200"
              name="prompt"
              placeholder="Wpisz co chcesz wygenerować"
              required
            />
            {trigger_word && (
              <div className="mt-2 text-secondary-foreground/70 text-sm">
                Słowo kluczowe: <span className="text-primary">{trigger_word}</span>
              </div>
            )}
          </div>
          
          {supportsImageInput && (
            <div className="p-6 border border-dashed border-secondary/60 rounded-xl bg-secondary/20">
              <label className="block text-secondary-foreground font-medium mb-3">
                Obraz startowy
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageInput}
                className="w-full text-sm text-secondary-foreground/80 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary-hover transition-all"
              />
              {referenceImage && (
                <div className="mt-4">
                  <img 
                    src={referenceImage} 
                    alt="Podgląd" 
                    className="w-40 h-40 object-cover rounded-lg border border-secondary/60"
                  />
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-secondary-foreground font-medium mb-2">
                Format obrazu
              </label>
              <div className="relative">
                <select
                  value={imageSize}
                  onChange={(e) => setImageSize(e.target.value)}
                  className="w-full px-4 py-3 bg-secondary/40 border border-secondary/60 rounded-lg text-background-foreground appearance-none cursor-pointer hover:border-primary/60 transition-colors"
                >
                  <option value="square">Kwadrat</option>
                  <option value="portrait">Pionowy</option>
                  <option value="landscape">Poziomy</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-primary hover:bg-primary-hover text-primary-foreground font-medium rounded-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></span>
                Generowanie...
              </>
            ) : (
              'Rozpocznij generowanie'
            )}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500">
            {error}
          </div>
        )}

        {images.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {images.map((img, index) => (
              <div key={index} className="group relative overflow-hidden rounded-xl border border-secondary/60 transition-all hover:border-primary/60">
                <img
                  src={img.url}
                  alt={`Wygenerowany obraz ${index + 1}`}
                  className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
                />
                <button
                  onClick={() => downloadImage(img.url, `generated-${Date.now()}.png`)}
                  className="absolute top-2 right-2 p-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/70"
                >
                  <Download className="w-5 h-5 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {wasTranslated && logs.length > 0 && (
          <div className="mt-6 p-6 bg-secondary/20 border border-secondary/40 rounded-xl">
            <h3 className="font-medium text-lg mb-3 text-secondary-foreground">
              Informacje o prompcie:
            </h3>
            <ul className="space-y-2">
              {logs.map((log, index) => (
                <li key={index} className="text-secondary-foreground/80 text-sm">
                  {log}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
