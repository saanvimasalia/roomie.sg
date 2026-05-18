import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import { OnboardingProvider } from './context/OnboardingContext'
import { AppProvider } from './context/AppContext'

// Onboarding pages
import Splash from './pages/onboarding/Splash'
import Verify from './pages/onboarding/Verify'
import BasicInfo from './pages/onboarding/BasicInfo'
import Hall from './pages/onboarding/Hall'
import Diet from './pages/onboarding/Diet'
import Routine from './pages/onboarding/Routine'
import Social from './pages/onboarding/Social'
import Living from './pages/onboarding/Living'
import Allergies from './pages/onboarding/Allergies'
import Prompts from './pages/onboarding/Prompts'
import Connect from './pages/onboarding/Connect'

// App pages
import Discover from './pages/app/Discover'
import Activity from './pages/app/Activity'
import Profile from './pages/app/Profile'
import EditProfile from './pages/app/EditProfile'
import ProfileDetail from './pages/app/ProfileDetail'

function AppShell() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-stone-100">
        <div className="relative mx-auto w-full max-w-[430px] min-h-screen bg-cream shadow-xl">
          <div className="pb-16">
            <Outlet />
          </div>
          <BottomNav />
        </div>
      </div>
    </AppProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Onboarding */}
        <Route
          path="/onboarding"
          element={
            <OnboardingProvider>
              <div className="min-h-screen bg-stone-100">
                <div className="relative mx-auto w-full max-w-[430px] min-h-screen bg-cream shadow-xl">
                  <Outlet />
                </div>
              </div>
            </OnboardingProvider>
          }
        >
          <Route index element={<Navigate to="splash" replace />} />
          <Route path="splash" element={<Splash />} />
          <Route path="verify" element={<Verify />} />
          <Route path="basic-info" element={<BasicInfo />} />
          <Route path="hall" element={<Hall />} />
          <Route path="diet" element={<Diet />} />
          <Route path="routine" element={<Routine />} />
          <Route path="social" element={<Social />} />
          <Route path="living" element={<Living />} />
          <Route path="allergies" element={<Allergies />} />
          <Route path="prompts" element={<Prompts />} />
          <Route path="connect" element={<Connect />} />
        </Route>

        {/* Main app */}
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Navigate to="discover" replace />} />
          <Route path="discover" element={<Discover />} />
          <Route path="activity" element={<Activity />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/edit" element={<EditProfile />} />
          <Route path="user/:id" element={<ProfileDetail />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/onboarding/splash" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
