'use client';

import { useState } from "react";
import Image from "next/image";

interface GenerateProps {
  modelId: string;
}

export default function Generate({ modelId }: GenerateProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setImageUrl(null);
    setIsLoading(true);

    const prompt = (e.currentTarget.elements.namedItem('prompt') as HTMLInputElement).value;

    try {
      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          model: modelId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setImageUrl(data.images[0].url);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Wystąpił błąd podczas generowania obrazu.");
      }
    } catch (err: any) {
      setError("Wystąpił błąd podczas wysyłania żądania.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-5">
      <h1 className="py-8 text-center font-bold text-3xl text-white">
        Wymarz coś pięknego
      </h1>

      <form className="w-full flex mb-6" onSubmit={handleSubmit}>
        <input
          type="text"
          className="flex-grow px-4 py-2 rounded-l-lg border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          name="prompt"
          placeholder="Wpisz prompt, aby wygenerować obraz"
        />
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-r-lg transition duration-300"
          type="submit"
        >
          Start!
        </button>
      </form>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {isLoading && <div className="text-white">Generowanie obrazu...</div>}

      {imageUrl && (
        <div className="image-wrapper mt-5 rounded-lg overflow-hidden shadow-lg">
          <Image
            src={imageUrl}
            alt="wygenerowany obraz"
            sizes="100vw"
            height={768}
            width={768}
            className="w-full h-auto"
          />
        </div>
      )}
    </div>
  );
}
