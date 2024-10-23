'use client';

import { useState, useRef } from "react";
import Image from "next/image";
import { fal } from "@fal-ai/client";

interface GenerateProps {
  modelId: string;
  supportsFileUpload: boolean;
  loraPath?: string; // Dodaj opcjonalny prop loraPath
}

export default function Generate({ modelId, supportsFileUpload, loraPath }: GenerateProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await fal.storage.upload(file);
        setUploadedFileUrl(url);
      } catch (error) {
        console.error("Błąd podczas przesyłania pliku:", error);
        setError("Wystąpił błąd podczas przesyłania pliku.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setImageUrl(null);
    setIsLoading(true);
    setQueuePosition(null);
    setLogs([]);
    setUploadedFileUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

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
          fileUrl: uploadedFileUrl,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setImageUrl(data.images[0].url);
        if (data.logs) {
          setLogs(data.logs);
        }
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

      <form className="w-full flex flex-col mb-6" onSubmit={handleSubmit}>
        <input
          type="text"
          className="flex-grow px-4 py-2 rounded-lg border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
          name="prompt"
          placeholder="Wpisz prompt, aby wygenerować obraz"
        />
        {supportsFileUpload && (
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="mb-2"
          />
        )}
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
          type="submit"
        >
          Start!
        </button>
      </form>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {isLoading && <div className="text-white">Generowanie obrazu...</div>}

      {queuePosition !== null && (
        <div className="text-white mb-4">Pozycja w kolejce: {queuePosition}</div>
      )}

      {logs.length > 0 && (
        <div className="text-white mb-4">
          <h3 className="font-bold mb-2">Logi:</h3>
          <ul className="list-disc list-inside">
            {logs.map((log, index) => (
              <li key={index}>{log}</li>
            ))}
          </ul>
        </div>
      )}

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
