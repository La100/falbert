'use client';

import { useState, useEffect } from "react";
import Image from "next/image";

interface GenerateProps {
  modelId: string;
}

export default function Generate({ modelId }: GenerateProps) {
  const [prediction, setPrediction] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [predictionId, setPredictionId] = useState<string | null>(null);

  const checkPredictionStatus = async () => {
    if (!predictionId) return null;
    try {
      const response = await fetch("/api/predictions/" + predictionId);
      const predictionData = await response.json();

      if (response.status !== 200) {
        setError(predictionData.detail);
        setIsLoading(false);
        return null;
      }

      return predictionData;
    } catch (err) {
      setError("Wystąpił błąd podczas sprawdzania statusu predykcji.");
      setIsLoading(false);
      return null;
    }
  };

  useEffect(() => {
    if (!predictionId) return;

    const pollPredictionStatus = async () => {
      const predictionData = await checkPredictionStatus();
      if (!predictionData) return;

      if (predictionData.status === "succeeded") {
        setPrediction(predictionData);
        setIsLoading(false);
      } else if (predictionData.status === "failed") {
        setError("Wystąpił błąd podczas generowania obrazu.");
        setIsLoading(false);
      } else {
        // Jeśli status nie jest "succeeded" ani "failed", czekamy 2 sekundy i sprawdzamy ponownie
        setTimeout(pollPredictionStatus, 10000);
      }
    };

    pollPredictionStatus();

    return () => {
      // Nie ma potrzeby anulowania, ponieważ setTimeout zostanie automatycznie wyczyszczony
    };
  }, [predictionId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setPrediction(null);
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
        const imageBlob = await response.blob();
        const imageUrl = URL.createObjectURL(imageBlob);
        setPrediction({ output: [imageUrl] });
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
          className="flex-grow px-4 py-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {prediction && prediction.output && (
        <div className="image-wrapper mt-5 rounded-lg overflow-hidden shadow-lg">
          <Image
            src={prediction.output[prediction.output.length - 1]}
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
