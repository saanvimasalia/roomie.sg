import type { ProfileWithScore } from '../types'
import Avatar from './Avatar'

type Props = {
  profile: ProfileWithScore
  currentUser: ProfileWithScore
  onSayHello: () => void
  onDismiss: () => void
}

export default function MatchMoment({ profile, currentUser, onSayHello, onDismiss }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onDismiss}
      />

      {/* Card */}
      <div className="relative mx-6 w-full max-w-sm bg-cream rounded-3xl px-6 py-8 flex flex-col items-center text-center animate-slide-up">
        <span className="text-4xl mb-3">🎉</span>
        <h2 className="font-syne text-2xl font-extrabold text-wb">It's a match!</h2>
        <p className="font-dm text-sm text-wb2 mt-1 mb-7">
          You and {profile.name} both liked each other.
        </p>

        {/* Avatars */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex flex-col items-center gap-2">
            <Avatar
              photoUrl={currentUser.photo_url}
              name={currentUser.name}
              userId={currentUser.id}
              size={72}
              className="ring-2 ring-terra ring-offset-2"
            />
            <span className="font-dm text-xs text-wb2">{currentUser.name}</span>
          </div>

          <div className="w-8 h-8 rounded-full bg-terra-light flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-terra" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
          </div>

          <div className="flex flex-col items-center gap-2">
            <Avatar
              photoUrl={profile.photo_url}
              name={profile.name}
              userId={profile.id}
              size={72}
              className="ring-2 ring-terra ring-offset-2"
            />
            <span className="font-dm text-xs text-wb2">{profile.name}</span>
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={onSayHello}
          className="w-full bg-terra text-white font-dm font-medium py-3.5 rounded-2xl mb-2 active:scale-[0.98] transition-transform"
        >
          Say hello 👋
        </button>
        <button
          onClick={onDismiss}
          className="w-full text-wb2 font-dm text-sm py-2"
        >
          Keep browsing
        </button>
      </div>
    </div>
  )
}
