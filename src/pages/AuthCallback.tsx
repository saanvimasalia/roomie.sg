import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    async function handleSession(session: import('@supabase/supabase-js').Session) {
      localStorage.removeItem('auth_intent')

      const chosenPassword = localStorage.getItem('signup_password')
      if (chosenPassword) {
        await supabase.auth.updateUser({ password: chosenPassword })
        localStorage.removeItem('signup_password')
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', session.user.id)
        .single()

      if (profile?.name) {
        navigate('/app/discover', { replace: true })
      } else {
        navigate('/onboarding/basic-info', { replace: true })
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
        subscription.unsubscribe()
        handleSession(session)
      } else if (event === 'INITIAL_SESSION' && !session) {
        navigate('/onboarding/splash', { replace: true })
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <p className="font-dm text-wb2">Signing you in…</p>
    </div>
  )
}
