import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function generateEmbeddingsForAudiences() {
  console.log('Generating embeddings using SQL function...');

  const { data, error } = await supabase.rpc('generate_all_embeddings');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Success!', data);
}

generateEmbeddingsForAudiences().catch(console.error);
