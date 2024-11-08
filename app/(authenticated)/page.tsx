import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getUser } from '@/utils/supabase/queries';

export default async function HomePage() {
  const supabase = createClient();
  const user = await getUser(supabase);



  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Twórz własne modele AI
        </h1>
        <p className="text-xl mb-8 text-primary">
          Trenuj, dostosowuj i generuj unikalne obrazy z pomocą sztucznej inteligencji
        </p>
        <div className="flex gap-4 justify-center">
       
        </div>
      </div>
    </div>
  );
}
