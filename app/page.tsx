
import { createClient } from '@/utils/supabase/server';
import {

  getUser
} from '@/utils/supabase/queries';
import Generate from '@/components/generate';
export default async function PricingPage() {
  const supabase = createClient();
  const [user] = await Promise.all([
    getUser(supabase),
 
  ]);

  return (
   <div>elo</div>
  );
}
