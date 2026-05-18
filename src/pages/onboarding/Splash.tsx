import { useNavigate } from 'react-router-dom'

export default function Splash() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col px-6">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-terra flex items-center justify-center mb-2">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3" />
          </svg>
        </div>
        <h1 className="font-syne text-4xl font-extrabold text-wb tracking-tight">roomie.sg</h1>
        <p className="font-dm text-wb2 text-base text-center leading-snug">
          Find your perfect NUS or NTU<br />dorm roommate
        </p>
      </div>

      {/* Actions */}
      <div className="pb-14 flex flex-col gap-3">
        <button
          onClick={() => navigate('/onboarding/verify')}
          className="w-full bg-terra text-white font-dm font-medium py-4 rounded-2xl text-base active:scale-[0.98] transition-transform"
        >
          Create account
        </button>
        <button
          onClick={() => navigate('/app/discover')}
          className="w-full bg-sand text-wb font-dm font-medium py-4 rounded-2xl text-base active:scale-[0.98] transition-transform"
        >
          Log in
        </button>
        <p className="font-dm text-xs text-wb3 text-center mt-2">
          Only .nus.edu.sg and .ntu.edu.sg emails
        </p>
      </div>
    </div>
  )
}
