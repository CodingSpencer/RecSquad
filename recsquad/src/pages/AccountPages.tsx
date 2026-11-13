import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Empty, ErrorMessage, Field, Loading, Page } from '../components/shared'
import { invalidateCachedData } from '../lib/dataCache'
import { canonicalizeState } from '../lib/location'
import { configurationMessage } from '../lib/pageData'
import { supabase } from '../lib/supabase'
import type { Profile, User } from '../types'

export function ProfilePage({ user }: { user: User | null }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [location, setLocation] = useState({ city: '', state: '' })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      if (!user) { setLoading(false); return }
      if (!supabase) { setError(configurationMessage); setLoading(false); return }
      const [{ data: profileData, error: profileError }, { data: locationData, error: locationError }] = await Promise.all([
        supabase.from('profiles').select('id, username, full_name, avatar_url').eq('id', user.id).maybeSingle(),
        supabase.from('account_settings').select('city, state').eq('user_id', user.id).maybeSingle(),
      ])
      if (profileError || locationError) {
        if (active) { setError(`Unable to load profile: ${(profileError ?? locationError)?.message}`); setLoading(false) }
        return
      }
      if (active) {
        setProfile(profileData as Profile | null)
        setLocation({ city: locationData?.city ?? '', state: locationData?.state ?? '' })
        setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [user?.id])

  async function saveLocation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    if (!supabase || !user) { setError('Sign in to update your account location.'); return }
    const city = location.city.trim()
    const state = canonicalizeState(location.state)
    if (city.length > 100 || state.length > 100) { setError('City and state must be 100 characters or fewer.'); return }
    if (Boolean(city) !== Boolean(state)) { setError('Enter both a city and state, or leave both blank.'); return }
    setBusy(true)
    const { error: saveError } = await supabase.from('account_settings').upsert({
      user_id: user.id, city: city || null, state: state || null, updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    if (saveError) setError(`Unable to save account location: ${saveError.message}`)
    else {
      invalidateCachedData(`feed:${user.id}`)
      setMessage('Location saved.')
    }
    setBusy(false)
  }

  if (!user) return <Page title="Profile"><Empty>You are not signed in. <Link className="text-link" to="/login">Sign in</Link> to manage your profile.</Empty></Page>
  if (loading) return <Page title="Profile"><Loading /></Page>
  const name = profile?.username || profile?.full_name || user.email || 'Player'
  return <Page title="Profile">{error && <ErrorMessage>{error}</ErrorMessage>}
    <div className="profile-summary card"><span className="avatar avatar-large">{name.trim().charAt(0).toUpperCase()}</span><div><strong>{name}</strong>{profile?.full_name && profile.full_name !== name && <p className="muted small">{profile.full_name}</p>}<p className="muted small">{user.email}</p></div></div>
    <section className="section-block"><h2>Account location</h2><p className="muted small">Used to show events near you in the Local feed.</p>
      <form className="form-stack location-form" onSubmit={(event) => void saveLocation(event)}>
        {message && <p className="success-message" role="status">{message}</p>}
        <div className="field-row"><Field label="City"><input maxLength={100} value={location.city} onChange={(event) => setLocation({ ...location, city: event.target.value })} /></Field><Field label="State"><input maxLength={100} value={location.state} onChange={(event) => setLocation({ ...location, state: event.target.value })} /></Field></div>
        <button className="button primary" disabled={busy}>{busy ? 'Saving...' : 'Save location'}</button>
      </form>
    </section>
  </Page>
}

export function SettingsPage() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') ?? 'system')
  useEffect(() => {
    const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.classList.toggle('dark', dark)
    if (theme === 'system') localStorage.removeItem('theme')
    else localStorage.setItem('theme', theme)
  }, [theme])
  return <Page title="Settings"><section className="settings-card card"><Field label="Theme"><select value={theme} onChange={(event) => setTheme(event.target.value)}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></Field><p className="muted small">Choose how RecSquad looks on this device.</p></section></Page>
}

export function NotFoundPage() {
  return <Page title="Page not found"><p className="muted">The page you’re looking for doesn’t exist.</p><Link className="text-link" to="/">Go to home <span aria-hidden="true">→</span></Link></Page>
}
