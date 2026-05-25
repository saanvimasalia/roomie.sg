import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import Avatar from '../../components/Avatar'
import { timeAgo, dayBucket } from '../../lib/utils'
import type { Activity as ActivityType } from '../../types'

// ─── Activity type meta ───────────────────────────────────────────────────────

type ActivityMeta = {
  icon: React.ReactNode
  iconBg: string
  text: (actorName: string) => string
  cta?: string
}

function HeartIcon() {
  return (
    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  )
}

const ACTIVITY_META: Record<ActivityType['type'], ActivityMeta> = {
  new_like: {
    icon:    <HeartIcon />,
    iconBg:  'bg-terra',
    text:    _ => 'liked your profile',
    cta:     'View',
  },
  new_match: {
    icon:    <StarIcon />,
    iconBg:  'bg-terra',
    text:    _ => "— it's a match! 🎉",
    cta:     'Connect',
  },
  connected: {
    icon:    <LinkIcon />,
    iconBg:  'bg-sage',
    text:    _ => 'viewed your contact details',
  },
}

// ─── Activity item ─────────────────────────────────────────────────────────────

type ItemProps = {
  activity: ActivityType
  wasUnread: boolean
  actorName: string
  actorPhotoUrl: string | null
  actorId: string
  onCta: () => void
}

function ActivityItem({ activity, wasUnread, actorName, actorPhotoUrl, actorId, onCta }: ItemProps) {
  const meta = ACTIVITY_META[activity.type]

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-colors ${
        wasUnread ? 'bg-terra-light/60' : 'bg-sand'
      }`}
    >
      {/* Avatar + icon badge */}
      <div className="relative flex-shrink-0">
        <Avatar photoUrl={actorPhotoUrl} name={actorName} userId={actorId} size={48} />
        <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center ${meta.iconBg}`}>
          {meta.icon}
        </div>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="font-dm text-sm text-wb leading-snug">
          <span className="font-semibold">{actorName}</span>
          {' '}
          {meta.text(actorName)}
        </p>
        <p className="font-dm text-xs text-wb3 mt-0.5">{timeAgo(activity.created_at)}</p>
      </div>

      {/* Unread dot */}
      {wasUnread && (
        <div className="w-2 h-2 rounded-full bg-terra flex-shrink-0" />
      )}

      {/* CTA button */}
      {meta.cta && (
        <button
          onClick={onCta}
          className="flex-shrink-0 bg-white border border-sand text-wb font-dm text-xs font-medium px-3 py-1.5 rounded-xl ml-1 active:scale-95 transition-transform"
        >
          {meta.cta}
        </button>
      )}
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

type BucketLabel = 'Today' | 'Yesterday' | 'Earlier'

export default function Activity() {
  const navigate = useNavigate()
  const { activities, actorProfileMap, markActivitiesRead } = useAppContext()

  // Capture which items were unread on mount — keep highlight visible during visit
  const [initialUnreadIds] = useState<string[]>(
    () => activities.filter(a => !a.is_read).map(a => a.id)
  )

  useEffect(() => {
    // Small delay so user sees what's new before badge clears
    const t = setTimeout(markActivitiesRead, 600)
    return () => clearTimeout(t)
  }, [markActivitiesRead])

  // Sort newest first
  const sorted = [...activities].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  // Group into date buckets
  const buckets: Record<BucketLabel, ActivityType[]> = { Today: [], Yesterday: [], Earlier: [] }
  for (const item of sorted) {
    buckets[dayBucket(item.created_at)].push(item)
  }
  const bucketOrder: BucketLabel[] = ['Today', 'Yesterday', 'Earlier']
  const nonEmptyBuckets = bucketOrder.filter(b => buckets[b].length > 0)

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="px-5 pt-14 pb-4 flex-shrink-0">
        <h1 className="font-syne text-2xl font-bold text-wb">Activity</h1>
        {initialUnreadIds.length > 0 && (
          <p className="font-dm text-sm text-wb2 mt-0.5">
            {initialUnreadIds.length} new notification{initialUnreadIds.length > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* List */}
      <div className="flex-1 px-5 pb-6">
        {sorted.length === 0 ? (
          <EmptyActivity />
        ) : (
          <div className="flex flex-col gap-6">
            {nonEmptyBuckets.map(bucket => (
              <div key={bucket}>
                <p className="font-dm text-xs font-medium text-wb3 uppercase tracking-wide mb-2">
                  {bucket}
                </p>
                <div className="flex flex-col gap-2">
                  {buckets[bucket].map(item => {
                    const actor = actorProfileMap[item.actor_id]
                    if (!actor) return null
                    return (
                      <ActivityItem
                        key={item.id}
                        activity={item}
                        wasUnread={initialUnreadIds.includes(item.id)}
                        actorName={actor.name}
                        actorPhotoUrl={actor.photo_url}
                        actorId={actor.id}
                        onCta={() => navigate(`/app/user/${actor.id}`)}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyActivity() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span className="text-5xl mb-4">🔔</span>
      <p className="font-syne text-lg font-bold text-wb">No activity yet</p>
      <p className="font-dm text-sm text-wb2 mt-1 mb-6">
        Likes and matches will show up here.
      </p>
      <button
        onClick={() => navigate('/app/discover')}
        className="bg-terra text-white font-dm font-medium px-5 py-3 rounded-2xl"
      >
        Browse profiles
      </button>
    </div>
  )
}
