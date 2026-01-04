import { createClient } from '@supabase/supabase-js';

// On utilise les valeurs directement pour éviter l'erreur de variables d'environnement manquantes
// Check for environment variables first, then fallback to hardcoded values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tomavuoenhywfsuzoxxr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvbWF2dW9lbmh5d2ZzdXpveHhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MTM2MTAsImV4cCI6MjA4MTk4OTYxMH0.Z7Q8V_lalvCxVhoGTvIEolf73HkkPv3i6jHLI_u7LW8';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Attention : Les clés Supabase sont manquantes !");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour ton application
export type Routine = {
    id: string;
    user_id: string;
    title: string;
    content: any;
    created_at: string;
};

export type ChatMessage = {
    id: string;
    user_id: string;
    role: 'user' | 'assistant';
    message: string;
    created_at: string;
};