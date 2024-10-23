import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function getUserModels(userId: string) {
  const { data: models, error } = await supabase
    .from('user_models')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return models;
}

export async function getModelByUrlId(urlId: string) {
  const { data: model, error } = await supabase
    .from('user_models')
    .select('*')
    .eq('url_id', urlId)
    .single();

  if (error) throw error;
  return model;
}
