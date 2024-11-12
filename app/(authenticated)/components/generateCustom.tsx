'use client';
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import PromptStarters from "./PromptStarters";
import { Download } from 'lucide-react';
import DownloadButton from './DownloadButton';

interface GenerateCustomProps {
  modelId: string;
  loraPath: string;
  trigger_word?: string;
}

interface GeneratedImage {
  url: string;
  originalUrl: string;
}

export default function GenerateCustom({ modelId, loraPath, trigger_word }: GenerateCustomProps) {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [prompt, setPrompt] = useState<string>('');
  const [wasTranslated, setWasTranslated] = useState<boolean>(false);
  const [imageSize, setImageSize] = useState<string>('square');
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setLogs([]);
    setImages([]);
    
    const prompt = (e.currentTarget.elements.namedItem('prompt') as HTMLInputElement).value;

    try {
      const supabase = createClientComponentClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Nie jesteś zalogowany');
      }

      // Tłumaczenie promptu
      const translationResponse = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: prompt,
          trigger_word
        }),
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
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          prompt: translatedText,
          model: modelId,
          loraPath,
          isCustom: true,
          imageSize,
          numImages: 1
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Wystąpił błąd podczas generowania obrazu.");
      }

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
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text  text-center">
          Wymarz coś pięknego
        </h1>

        <div className="mb-8">
          <PromptStarters
            onSelectPrompt={(selectedPrompt) => setPrompt(selectedPrompt)}
            trigger_word={trigger_word || ''}
          />
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
            <input
              type="text"
              className="w-full px-6 py-4 bg-secondary/40 border border-secondary/60 rounded-xl text-background-foreground placeholder-secondary-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition duration-200"
              name="prompt"
              placeholder="Opisz swoją wizję..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            {trigger_word && (
              <div className="mt-2 text-secondary-foreground/70 text-sm">
                Słowo kluczowe: <span className="text-primary">{trigger_word}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-secondary-foreground font-medium mb-2">
                Format obrazu
              </label>
              <select
                value={imageSize}
                onChange={(e) => setImageSize(e.target.value)}
                className="w-full px-4 py-3 bg-secondary/40 border border-secondary/60 rounded-lg text-background-foreground appearance-none"
              >
                <option value="square">Kwadrat (1536x1536)</option>
                <option value="portrait">Pionowy (1536x2752)</option>
                <option value="landscape">Poziomy (2752x1536)</option>
              </select>
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

        {queuePosition !== null && (
          <div className="mt-6 p-4 bg-primary/10 border border-primary/30 rounded-lg text-primary-foreground">
            <div className="flex items-center gap-2">
              <span className="animate-pulse">⏳</span>
              Pozycja w kolejce: {queuePosition}
            </div>
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
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <DownloadButton 
                    url={img.url} 
                    filename={`generated-custom-${Date.now()}.png`}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 text-white text-sm">
                    Wariant {index + 1}
                  </div>
                </div>
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
