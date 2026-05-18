import { NavLink } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

export default function BottomNav() {
  const { unreadCount } = useAppContext()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
      <div className="w-full max-w-[430px] bg-cream border-t border-sand flex justify-around items-center h-16 px-6">
        {/* Discover */}
        <NavLink
          to="/app/discover"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 transition-colors ${
              isActive ? 'text-terra' : 'text-wb3'
            }`
          }
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
          <span className="font-dm text-[10px] font-medium">Discover</span>
        </NavLink>

        {/* Activity */}
        <NavLink
          to="/app/activity"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 transition-colors ${
              isActive ? 'text-terra' : 'text-wb3'
            }`
          }
        >
          <div className="relative">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-terra text-white text-[9px] font-dm font-bold rounded-full flex items-center justify-center leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <span className="font-dm text-[10px] font-medium">Activity</span>
        </NavLink>

        {/* Profile */}
        <NavLink
          to="/app/profile"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 transition-colors ${
              isActive ? 'text-terra' : 'text-wb3'
            }`
          }
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="font-dm text-[10px] font-medium">Profile</span>
        </NavLink>
      </div>
    </nav>
  )
}
