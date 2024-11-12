import React, { useState, useEffect } from 'react';
import { IconType } from 'react-icons';
import { FaUser, FaBox, FaPalette, FaImage, FaFont, FaPaw, FaHamburger } from 'react-icons/fa';
import { fal } from "@fal-ai/client";
import JSZip from 'jszip';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import Link from 'next/link';
import { Button } from '@/app/components/ui/button2';
import { getUser } from '@/utils/supabase/queries';
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

// Dodaj interfejs props
interface NewModelProps {
  onTypeChange?: (type: string) => void;
}

const NewModel: React.FC<NewModelProps> = ({ onTypeChange }) => {
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
      try {
        const user = await getUser(supabase);
        if (!user) {
          router.push('/signin');
          return;
        }
        setSession({ user });
      } catch (error) {
        console.error('Błąd podczas weryfikacji użytkownika:', error);
        setError('Błąd podczas weryfikacji użytkownika');
      }
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
    onTypeChange?.(typeName);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setTrainingStatus('Rozpoczynam proces trenowania...');

    try {
      const supabase = createClientComponentClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Nie jesteś zalogowany');
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

  // Komponent logowania bez zmian
  if (!session) {
    return (
      <div className="bg-secondary/30 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-secondary/50">
        <p className="text-background-foreground mb-4">Musisz być zalogowany, aby trenować modele.</p>
        <Link 
          href="/signin"
          className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
        >
          Zaloguj się
          <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    );
  }
 
  return (
    <div className="bg-secondary/30 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-secondary/50">
      <h2 className="text-2xl font-bold mb-8 text-background-foreground">
        Szczegóły Modelu
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label htmlFor="modelName" className="block text-secondary-foreground font-medium mb-2">
            Nazwa Modelu
          </label>
          <input
            type="text"
            id="modelName"
            placeholder="np. Zdjęcia Soni"
            className="w-full px-6 py-4 bg-secondary/40 border border-secondary/60 rounded-xl text-background-foreground placeholder-secondary-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition duration-200"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
          />
        </div>

        <div>
          <p className="block text-secondary-foreground font-medium mb-4">Typ Podmiotu</p>
          <div className="grid grid-cols-4 gap-4">
            {subjectTypes.map((type) => (
              <button
                key={type.name}
                type="button"
                className={`p-4 rounded-xl border transition-all duration-300 ${
                  selectedType === type.name 
                  ? 'border-primary bg-primary/10 text-primary' 
                  : 'border-secondary/60 hover:border-primary/50 text-secondary-foreground hover:bg-secondary/40'
                }`}
                onClick={() => handleTypeSelection(type.name)}
              >
                <type.icon className="text-2xl mb-2 mx-auto" />
                <span className="text-xs">{type.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 border border-dashed border-secondary/60 rounded-xl bg-secondary/20">
          <p className="block text-secondary-foreground font-medium mb-3">Próbki</p>
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
            className="cursor-pointer block text-center p-6 rounded-xl transition-colors hover:bg-secondary/30 border border-secondary/40"
          >
            <svg className="w-8 h-8 text-secondary-foreground/70 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <p className="text-background-foreground">Upuść obrazy tutaj lub kliknij, aby wybrać</p>
            <p className="text-sm text-secondary-foreground/70 mt-1">Wgraj 4-20 obrazów (format JPG, PNG)</p>
          </label>

          {imagePreviews.length > 0 && (
            <div className="mt-6 grid grid-cols-4 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="group relative overflow-hidden rounded-xl border border-secondary/60 transition-all hover:border-primary/60">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 bg-background/80 text-primary p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
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

        <Button
        variant="secondary"
          type="submit"
          disabled={isLoading || images.length < 1 || !modelName || !selectedType}
          className="w-full py-4 bg-primary hover:bg-primary-hover text-primary-foreground font-medium rounded-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></span>
              Przetwarzanie...
            </>
          ) : (
            'Trenuj Model'
          )}
        </Button>
        
        {trainingStatus && (
          <div className="mt-6 p-4 bg-primary/10 border border-primary/30 rounded-xl text-primary-foreground">
            <div className="flex items-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></span>
              <p>{trainingStatus}</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500">
            {error}
          </div>
        )}
      </form>
    </div>
  );
};

export default NewModel;
