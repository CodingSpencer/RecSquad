import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ErrorMessage, Field, Page } from '../components/shared'
import { configurationMessage } from '../lib/pageData'
import { supabase } from '../lib/supabase'
import type { User } from '../types'

export function HomePage({ user }: { user: User | null }) {
  return (
    <div className="home-page">
      <section className="hero-panel">
        <div className="eyebrow">Find your people. Play your game.</div>
        <h1>Find your sport and join a team.</h1>
        <p>RecSquad connects players with local sports groups and events. Create a profile, find a game, and get in on the action.</p>
        <div className="button-row">
          <Link className="button primary" to={user ? '/feed' : '/login'}>{user ? 'Explore the feed' : 'Get started'}</Link>
          <Link className="button secondary" to="/groups">Explore groups</Link>
        </div>
      </section>
      <section className="feature-grid" aria-label="RecSquad features">
        <Feature title="Your local feed" description="Discover events near you, across your favorite sports, and what's popular." href="/feed" />
        <Feature title="Find a game" description="Browse upcoming games, practices, and pickup sessions." href="/events" />
        <Feature title="Build your squad" description="Find a community or create a group for your sport." href="/groups" />
      </section>
    </div>
  )
}

function Feature({ title, description, href }: { title: string; description: string; href: string }) {
  return <article className="feature-card"><h2>{title}</h2><p>{description}</p><Link className="text-link" to={href}>Explore <span aria-hidden="true">→</span></Link></article>
}

export function AboutPage() {
  return <Page title="About RecSquad"><p className="lead">RecSquad brings players together through local sports groups and events.</p><Link className="text-link" to="/">Back to home <span aria-hidden="true">→</span></Link></Page>
}

export function LoginPage({ onUserChange }: { onUserChange: (user: User | null) => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (!supabase) {
      setError(configurationMessage)
      return
    }
    setBusy(true)
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') ?? '').trim()
    const password = String(form.get('password') ?? '')
    if (mode === 'login') {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) setError(authError.message)
      else {
        onUserChange(data.user)
        navigate('/')
      }
    } else {
      const username = String(form.get('username') ?? '').trim()
      const fullName = String(form.get('full_name') ?? '').trim()
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username, full_name: fullName } },
      })
      if (authError) setError(authError.message)
      else if (data.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: data.user.id,
          username,
          full_name: fullName || null,
          updated_at: new Date().toISOString(),
        })
        if (profileError) setError(`Account created, but the profile could not be saved: ${profileError.message}`)
        else {
          onUserChange(data.user)
          navigate('/')
        }
      }
    }
    setBusy(false)
  }

  return (
    <Page narrow title={mode === 'login' ? 'Welcome back' : 'Create your account'}>
      <p className="muted">Sign in to find your next game.</p>
      <form className="form-stack card form-card" onSubmit={(event) => void submit(event)}>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Field label="Email"><input name="email" type="email" autoComplete="email" required /></Field>
        <Field label="Password"><input name="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={6} /></Field>
        {mode === 'signup' && <>
          <Field label="Username"><input name="username" required autoComplete="username" /></Field>
          <Field label="Full name"><input name="full_name" autoComplete="name" /></Field>
        </>}
        <button className="button primary full-width" type="submit" disabled={busy}>{busy ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
      </form>
      <p className="centered muted">{mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
        <button className="inline-button" type="button" onClick={() => { setError(''); setMode(mode === 'login' ? 'signup' : 'login') }}>{mode === 'login' ? 'Sign up' : 'Sign in'}</button>
      </p>
    </Page>
  )
}
