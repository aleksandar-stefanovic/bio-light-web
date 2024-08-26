import type {AuthResponse, AuthError} from '@supabase/supabase-js';
import supabase from '../supabase/client';

export async function signIn(email: string, password: string): Promise<AuthResponse> {
    return await supabase.auth.signInWithPassword({email, password});
}

export async function signOut(): Promise<{error: AuthError | null}> {
    return  await supabase.auth.signOut();
}
