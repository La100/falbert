'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { models as staticModels } from '@/utils/models';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

type UserModel = Database['public']['Tables']['user_models']['Row'];

export default function ModelsPage() {
  const [userModels, setUserModels] = useState<UserModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    async function loadModels() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: models, error } = await supabase
            .from('user_models')
            .select('*')
            .eq('user_id', session.user.id);

          if (error) throw error;
          setUserModels(models || []);
        }
      } catch (err) {
        console.error('Błąd podczas ładowania modeli:', err);
        setError('Nie udało się załadować modeli');
      } finally {
        setIsLoading(false);
      }
    }

    loadModels();
  }, [supabase]);

  if (isLoading) return <div>Ładowanie...</div>;
  if (error) return <div>Błąd: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Modele</h1>
      
      {/* Statyczne modele */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Modele publiczne</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staticModels.map((model) => (
            <Link 
              key={model.id} 
              href={`/models/${model.id}`}
              className="p-4 border border-gray-700 rounded-lg hover:bg-gray-800"
            >
              <h3 className="font-bold">{model.name}</h3>
              <p className="text-gray-400">{model.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Modele użytkownika */}
      {userModels.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Twoje modele</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userModels.map((model) => (
              <Link 
                key={model.id} 
                href={`/models/${model.url_id}`}
                className="p-4 border border-gray-700 rounded-lg hover:bg-gray-800"
              >
                <h3 className="font-bold">{model.name}</h3>
                <p className="text-gray-400">Model użytkownika</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
