import { supabase } from '@/lib/supabase'

export async function signIn(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'azure',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      scopes: 'openid email profile',
    },
  })
  if (error) throw error
}

export async function handleAuthCallback(): Promise<void> {
  const { error } = await supabase.auth.exchangeCodeForSession(window.location.href)
  if (error) throw error
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
