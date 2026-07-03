import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="font-dm text-wb2">Loading…</p>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/onboarding/splash" replace />
  }

  return <>{children}</>
}
