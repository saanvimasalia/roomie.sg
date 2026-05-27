import { useState } from 'react'
import type { ProfileWithScore } from '../types'
import { supabase } from '../lib/supabase'

type Props = {
  profile: ProfileWithScore
  currentUser: ProfileWithScore
  onClose: () => void
}

function buildDeepLink(profile: ProfileWithScore): string {
  if (profile.connect_platform === 'telegram') {
    const handle = profile.connect_handle?.replace('@', '') ?? ''
    return `https://t.me/${handle}`
  }
  // WhatsApp: strip everything except digits
  const digits = (profile.connect_handle ?? '').replace(/\D/g, '')
  return digits ? `https://wa.me/${digits}` : 'https://wa.me'
}

function buildIntroMessage(me: ProfileWithScore, them: ProfileWithScore): string {
  return `Hey ${them.name}! 👋 I matched with you on roomie.sg and think we'd make great roommates. I'm ${me.name}, a ${me.year} ${me.university} student studying ${me.faculty}. Would love to chat more!`
}

export default function ConnectModal({ profile, currentUser, onClose }: Props) {
  const [copied, setCopied] = useState(false)
  const message = buildIntroMessage(currentUser, profile)
  const deepLink = buildDeepLink(profile)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard not available
    }
  }

  const handleOpen = () => {
    supabase.rpc('log_connect', {
      p_connector_id: currentUser.id,
      p_connected_to_id: profile.id,
    })
    window.open(deepLink, '_blank')
    onClose()
  }

  const platformLabel = profile.connect_platform === 'telegram' ? 'Telegram' : 'WhatsApp'
  const platformColor = profile.connect_platform === 'telegram' ? '#229ED9' : '#25D366'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full max-w-[480px] bg-cream rounded-t-3xl px-5 pt-5 pb-10 animate-slide-up">
        {/* Handle */}
        <div className="w-10 h-1 bg-wb3 rounded-full mx-auto mb-5" />

        <h3 className="font-syne text-xl font-bold text-wb mb-1">
          Connect with {profile.name}
        </h3>
        <p className="font-dm text-sm text-wb2 mb-5">
          Copy this intro and send it on {platformLabel}.
        </p>

        {/* Message preview */}
        <div className="bg-sand rounded-2xl px-4 py-3.5 mb-4 relative">
          <p className="font-dm text-sm text-wb leading-relaxed pr-8">{message}</p>
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 text-wb3 hover:text-wb transition-colors"
            aria-label="Copy message"
          >
            {copied ? (
              <svg className="w-4 h-4 text-sage" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
            )}
          </button>
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="w-full bg-sand text-wb font-dm font-medium py-3.5 rounded-2xl mb-2 active:scale-[0.98] transition-transform"
        >
          {copied ? '✓ Copied!' : 'Copy message'}
        </button>

        {/* Open platform button */}
        <button
          onClick={handleOpen}
          className="w-full text-white font-dm font-medium py-3.5 rounded-2xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          style={{ backgroundColor: platformColor }}
        >
          <span>Open {platformLabel}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </button>
      </div>
    </div>
  )
}
