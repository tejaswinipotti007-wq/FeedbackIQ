import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || 'https://lzogqfrdwkorfoccguea.supabase.co'
const SUPABASE_KEY  = import.meta.env.VITE_SUPABASE_KEY  || 'sb_publishable_aTZBzAlEQTjIl2zs5igsOA_ITWV8mYJ'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  })
  if (error) console.error('Google sign in error:', error)
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}