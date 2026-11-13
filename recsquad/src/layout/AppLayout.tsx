import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { prefetchPageData, loadFeedData, loadGroups, loadUpcomingEvents } from '../lib/pageData'
import { supabase } from '../lib/supabase'
import type { User } from '../types'

export function AppLayout({
  user,
  authLoading,
  onUserChange,
}: {
  user: User | null
  authLoading: boolean
  onUserChange: (user: User | null) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const name = user?.email ?? 'Profile'

  async function signOut() {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) {
      window.alert(`Unable to sign out: ${error.message}`)
      return
    }
    onUserChange(null)
    setMenuOpen(false)
  }

  return (
    <>
      <header className="site-header">
        <nav className="site-nav" aria-label="Main navigation">
          <Link className="brand" to="/">RecSquad</Link>
          <div className="nav-links">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/feed" onPointerEnter={() => prefetchPageData(loadFeedData(user?.id ?? null), 'event feed')} onFocus={() => prefetchPageData(loadFeedData(user?.id ?? null), 'event feed')}>Feed</NavLink>
            <NavLink to="/events" onPointerEnter={() => prefetchPageData(loadUpcomingEvents(), 'events')} onFocus={() => prefetchPageData(loadUpcomingEvents(), 'events')}>Events</NavLink>
            <NavLink to="/groups" onPointerEnter={() => prefetchPageData(loadGroups(), 'groups')} onFocus={() => prefetchPageData(loadGroups(), 'groups')}>Groups</NavLink>
          </div>
          <div className="nav-account">
            {authLoading ? <span className="muted small">Loading...</span> : user ? (
              <div className="account-menu">
                <button className="account-button" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen}>
                  <span className="avatar avatar-small">{name.trim().charAt(0).toUpperCase()}</span>
                  <span className="account-name">{name}</span>
                </button>
                {menuOpen && (
                  <div className="account-dropdown">
                    <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
                    <Link to="/settings" onClick={() => setMenuOpen(false)}>Settings</Link>
                    <button type="button" onClick={() => void signOut()}>Log out</button>
                  </div>
                )}
              </div>
            ) : <Link className="sign-in-link" to="/login">Sign in</Link>}
          </div>
        </nav>
      </header>
      <main className="site-content"><Outlet /></main>
      <footer className="site-footer">
        <span>RecSquad</span>
        <Link to="/about">About</Link>
      </footer>
    </>
  )
}
