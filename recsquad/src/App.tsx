import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import { supabase } from './lib/supabase'
import { NotFoundPage, ProfilePage, SettingsPage } from './pages/AccountPages'
import { CreateEventPage, EventPage, EventsPage } from './pages/EventsPages'
import { FeedPage } from './pages/FeedPage'
import { CreateGroupPage, GroupPage, GroupsPage } from './pages/GroupPages'
import { AboutPage, HomePage, LoginPage } from './pages/PublicPages'
import type { User } from './types'
import './App.css'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false)
      return
    }

    let active = true
    void supabase.auth.getSession().then(({ data, error }) => {
      if (error) console.error('Unable to load session:', error.message)
      if (active) {
        setUser(data.session?.user ?? null)
        setAuthLoading(false)
      }
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout user={user} authLoading={authLoading} onUserChange={setUser} />}>
          <Route index element={<HomePage user={user} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage onUserChange={setUser} />} />
          <Route path="/feed" element={<FeedPage user={user} />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventPage user={user} />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/groups/new" element={<CreateGroupPage user={user} />} />
          <Route path="/groups/:id" element={<GroupPage user={user} />} />
          <Route path="/groups/:id/events/new" element={<CreateEventPage user={user} />} />
          <Route path="/profile" element={<ProfilePage user={user} />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
