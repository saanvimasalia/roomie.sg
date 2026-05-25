import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        subscription.unsubscribe()
        localStorage.removeItem('auth_intent')

        // Check if the user has completed onboarding (name is set)
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
