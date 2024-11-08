'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import { LoadingSpinner } from '@/app/components/ui/spinner';
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

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner className="w-10 h-10 text-primary" />
    </div>
  );

  if (error) return (
    <div className="container mx-auto px-4 py-8">
      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500">
        {error}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Twoje Modele
          </h1>
          <Link
            href="/train"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl transition-all duration-200 font-medium"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Trenuj nowy model
          </Link>
        </div>

        {/* Modele użytkownika */}
        {userModels.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Twoje modele</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userModels.map((model) => (
                <Link 
                  key={model.id} 
                  href={`/models/${model.url_id}`}
                  className="block bg-white rounded-3xl p-8 border-2 border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-2xl text-gray-900">
                      {model.name}
                    </h3>
                    <div className="p-3 bg-gray-100 rounded-full">
                      <svg 
                        className="w-5 h-5 text-gray-500" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                  
                  <p className="text-gray-500 text-sm mb-4">Model użytkownika</p>
                  
                  <div>
                    <span className="inline-flex items-center px-4 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-full">
                      Status: Aktywny
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
