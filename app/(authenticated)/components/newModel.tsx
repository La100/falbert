import React, { useState, useEffect } from 'react';
import { IconType } from 'react-icons';
import { FaUser, FaBox, FaPalette, FaImage, FaFont, FaPaw, FaHamburger } from 'react-icons/fa';
import { fal } from "@fal-ai/client";
import JSZip from 'jszip';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import Link from 'next/link';
// Zmiana na createClientComponentClient
const supabase = createClientComponentClient<Database>();

interface SubjectType {
  name: string;
  icon: IconType;
}

const subjectTypes: SubjectType[] = [
  { name: 'Man', icon: FaUser },
  { name: 'Woman', icon: FaUser },
  { name: 'Produkt', icon: FaBox },
  { name: 'Styl', icon: FaPalette },
  { name: 'Obiekt', icon: FaImage },
  { name: 'Czcionka', icon: FaFont },
  { name: 'Zwierzę', icon: FaPaw },
  { name: 'Jedzenie', icon: FaHamburger },
];

const NewModel: React.FC = () => {
  const router = useRouter();
  const [modelName, setModelName] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  // Dodaj nowy stan dla podglądu zdjęć
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  // Dodajemy nowy stan dla statusu
  const [trainingStatus, setTrainingStatus] = useState<string>('');

  // Dodajemy useEffect do sprawdzania sesji
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Błąd podczas sprawdzania sesji:', error);
        setError('Błąd podczas sprawdzania sesji');
        return;
      }
      console.log('Aktualna sesja:', currentSession);
      setSession(currentSession);
    };

    checkSession();
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      
      // Dodaj nowe pliki do istniejących
      setImages(prevImages => [...prevImages, ...newFiles]);
      
      // Dodaj nowe podglądy do istniejących
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
    }
  };

  const handleTypeSelection = (typeName: string) => {
    setSelectedType(typeName);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setTrainingStatus('Rozpoczynam proces trenowania...');

    try {
      if (!session) {
        console.log('Brak sesji - sprawdzam ponownie...');
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!currentSession) {
          console.error('Brak sesji po ponownym sprawdzeniu');
          throw new Error('Nie jesteś zalogowany. Zaloguj się i spróbuj ponownie.');
        }
        setSession(currentSession);
      }

      setTrainingStatus('Przygotowywanie plików...');
      const zip = new JSZip();
      
      // Dodaj wszystkie obrazy do archiwum ZIP
      const imagePromises = images.map(async (image, index) => {
        const arrayBuffer = await image.arrayBuffer();
        zip.file(`image_${index + 1}.jpg`, arrayBuffer);
      });

      await Promise.all(imagePromises);

      setTrainingStatus('Kompresowanie obrazów...');
      const zipBlob = await zip.generateAsync({ 
        type: "blob",
        mimeType: "application/zip",
        compression: "DEFLATE",
        compressionOptions: {
          level: 5
        }
      });

      setTrainingStatus('Wysyłanie plików na serwer...');
      const zipFile = new File([zipBlob], 'images.zip', { type: 'application/zip' });

      const formData = new FormData();
      formData.append('zipFile', zipFile);
      formData.append('modelName', modelName);
      formData.append('selectedType', selectedType);

      setTrainingStatus('Trenowanie modelu...');
      const response = await fetch('/api/train-model', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Błąd podczas przesyłania modelu');
      }

      const result = await response.json();
      setTrainingStatus('Model został pomyślnie wytrenowany!');
      
      router.push('/models');
    } catch (err: any) {
      console.error('Szczegóły błędu:', err);
      setError(err.message || 'Wystąpił błąd podczas przesyłania modelu');
      setTrainingStatus('');
    } finally {
      setIsLoading(false);
    }
  };

  // Dodaj funkcję usuwania zdjęć
  const handleRemoveImage = (index: number) => {
    setImages(prevImages => {
      const newImages = [...prevImages];
      newImages.splice(index, 1);
      return newImages;
    });
    
    setImagePreviews(prevPreviews => {
      const newPreviews = [...prevPreviews];
      // Zwolnij URL podglądu przed usunięciem
      URL.revokeObjectURL(newPreviews[index]);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  // Dodajemy komunikat o braku sesji
  if (!session) {
    return (
      <div className="bg-gray-900 text-gray-100 p-6 rounded-lg max-w-2xl mx-auto">
        <p className="text-center mb-4">Musisz być zalogowany, aby trenować modele.</p>
        <div className="text-center">
          <Link 
            href="/signin"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Zaloguj się
          </Link>
        </div>
      </div>
    );
  }
 
  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 text-gray-100 p-6 rounded-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Trenuj Model</h2>
      <p className="text-gray-400 mb-6">Wybierz nazwę, typ i wgraj co najmniej 4 zdjęcia, aby rozpocząć.</p>

      <div className="mb-6">
        <label htmlFor="modelName" className="block text-sm font-medium mb-2">Nazwa</label>
        <input
          type="text"
          id="modelName"
          placeholder="np. Zdjęcia Soni"
          className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
        />
      </div>

      <div className="mb-6">
        <p className="text-sm font-medium mb-2">Typ Podmiotu</p>
        <div className="grid grid-cols-4 gap-4">
          {subjectTypes.map((type) => (
            <button
              key={type.name}
              type="button"
              className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
                selectedType === type.name ? 'border-blue-500 bg-blue-900' : 'border-gray-700 hover:bg-gray-800'
              }`}
              onClick={() => handleTypeSelection(type.name)}
            >
              <type.icon className="text-2xl mb-2" />
              <span className="text-xs">{type.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm font-medium mb-2">Próbki</p>
        <div className="border-2 border-dashed border-gray-700 rounded-lg p-4">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="imageUpload"
          />
          <label
            htmlFor="imageUpload"
            className="cursor-pointer block text-center p-4 hover:bg-gray-800 rounded transition-colors"
          >
            <div className="flex flex-col items-center gap-2">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <p className="font-medium">Upuść obrazy tutaj lub kliknij, aby wybrać</p>
              <p className="text-sm text-gray-500">Wgraj 4-20 obrazów (format JPG, PNG)</p>
            </div>
          </label>

          {imagePreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-4 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {images.length > 0 && (
          <p className="mt-2 text-sm text-gray-400">
            Wybrano {images.length} {images.length === 1 ? 'obraz' : images.length < 5 ? 'obrazy' : 'obrazów'}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || images.length < 1 || !modelName || !selectedType}
        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
      >
        {isLoading ? 'Przetwarzanie...' : 'Trenuj Model'}
      </button>
      
      {/* Dodajemy wyświetlanie statusu */}
      {trainingStatus && (
        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
            <p className="text-sm text-gray-300">{trainingStatus}</p>
          </div>
        </div>
      )}
      
      {error && <p className="mt-4 text-red-500">{error}</p>}
    </form>
  );
};

export default NewModel;
