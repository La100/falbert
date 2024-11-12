import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import DownloadButton from '../components/DownloadButton';

export default async function GaleriaPage() {
  const supabase = createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    redirect('/signin');
  }

  // Pobierz listę obrazów z bucketa dla danego użytkownika
  const { data: images, error } = await supabase
    .storage
    .from('bucket')
    .list(`generated/${user.id}`, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' },
    });

  if (error) {
    console.error('Błąd podczas pobierania obrazów:', error);
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-500">
          Wystąpił błąd podczas ładowania galerii
        </div>
      </div>
    );
  }

  // Pobierz podpisane URL-e dla każdego obrazu
  const imageUrls = await Promise.all(
    images?.map(async (image) => {
      const path = `generated/${user.id}/${image.name}`;
      
      // Tworzymy podpisany URL ważny przez 1 godzinę (3600 sekund)
      const { data } = await supabase
        .storage
        .from('bucket')
        .createSignedUrl(path, 3600);

      return {
        name: image.name,
        url: data?.signedUrl,
        created_at: image.created_at,
        metadata: image.metadata
      };
    }) || []
  );

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        Twoja Galeria
      </h1>

      {imageUrls && imageUrls.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {imageUrls.map((image) => (
            <div 
              key={image.name}
              className="relative aspect-square rounded-lg overflow-hidden group"
            >
              <img
                src={image.url}
                alt={image.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                <DownloadButton url={image.url} filename={image.name} />
                <div className="text-white">
                  <p className="text-sm">
                    Utworzono: {new Date(image.created_at).toLocaleDateString('pl-PL')}
                  </p>
                  <p className="text-sm">
                    Rozmiar: {Math.round(image.metadata.size / 1024)} KB
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 text-gray-500">
          Brak wygenerowanych obrazów
        </div>
      )}
    </div>
  );
}
