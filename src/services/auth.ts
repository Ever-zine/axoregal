import { supabase } from '@/lib/supabase'

export async function signIn(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'azure',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      scopes: 'openid email profile User.Read',
    },
  })
  if (error) throw error
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export async function syncMicrosoftAvatar(userId: string, providerToken: string): Promise<void> {
  const res = await fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
    headers: { Authorization: `Bearer ${providerToken}` },
  })

  if (!res.ok) return

  const dataUrl = await blobToDataUrl(await res.blob())

  await supabase.from('profiles').update({ avatar_url: dataUrl }).eq('id', userId)
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
