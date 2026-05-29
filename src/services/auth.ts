import { supabase } from '@/lib/supabase'

export async function signIn(): Promise<void> {
  const { data, error } = await supabase.auth.signInWithSSO({
    domain: import.meta.env.VITE_SSO_DOMAIN,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  if (error) throw error
  if (data.url) window.location.href = data.url
}

export async function handleAuthCallback(): Promise<void> {
  const { error } = await supabase.auth.exchangeCodeForSession(window.location.href)
  if (error) throw error
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
