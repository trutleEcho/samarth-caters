import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export async function handleSignInWithGoogle() {
  const supabase = createClientComponentClient()

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${location.origin}/auth/callback`,
    },
  })

  if (error) {
    console.error('OAuth sign-in error:', error)
    throw error
  }
}
