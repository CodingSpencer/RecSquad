import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { canonicalizeState, normalizeState } from './lib/location'
import { supabase } from './lib/supabase'
import './App.css'

type User = { id: string; email?: string }
type Profile = {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
}
type Group = {
  id: string
  name: string
  city: string | null
  state: string | null
  sport: string | null
  description?: string | null
  image_url?: string | null
  created_by?: string | null
}
type Event = {
  id: string
  group_id: string
  title: string
  skill_level: string
  event_style: string
  event_type: string
  start_time: string
  city: string | null
  state: string | null
  is_recurring: boolean
  recurrence_days: string[]
  recurrence_end_date: string | null
  max_players: number | null
  venue_address: string | null
  group?: Group | null
  rsvpCount?: number
}

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
      <AppShell user={user} authLoading={authLoading} onUserChange={setUser}>
        <Routes>
          <Route path="/" element={<HomePage user={user} />} />
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
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}

function AppShell({
  user,
  authLoading,
  onUserChange,
  children,
}: {
  user: User | null
  authLoading: boolean
  onUserChange: (user: User | null) => void
  children: ReactNode
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
            <NavLink to="/feed">Feed</NavLink>
            <NavLink to="/events">Events</NavLink>
            <NavLink to="/groups">Groups</NavLink>
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
      <main className="site-content">{children}</main>
      <footer className="site-footer">
        <span>RecSquad</span>
        <Link to="/about">About</Link>
      </footer>
    </>
  )
}

function HomePage({ user }: { user: User | null }) {
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

function AboutPage() {
  return <Page title="About RecSquad"><p className="lead">RecSquad brings players together through local sports groups and events.</p><Link className="text-link" to="/">Back to home <span aria-hidden="true">→</span></Link></Page>
}

function LoginPage({ onUserChange }: { onUserChange: (user: User | null) => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (!supabase) {
      setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.')
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

function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      if (!supabase) {
        setError(configurationMessage)
        setLoading(false)
        return
      }
      const { data, error: queryError } = await supabase.from('groups').select('*').order('created_at', { ascending: false })
      if (!active) return
      if (queryError) setError(`Unable to load groups: ${queryError.message}`)
      else setGroups((data ?? []) as Group[])
      setLoading(false)
    }
    void load()
    return () => { active = false }
  }, [])

  return (
    <Page title="Groups" action={<Link className="button primary" to="/groups/new">Create group</Link>}>
      {error ? <ErrorMessage>{error}</ErrorMessage> : loading ? <Loading /> : groups.length === 0 ? <Empty>No groups yet. Create one to get started.</Empty> : (
        <div className="list-stack">{groups.map((group) => <GroupCard key={group.id} group={group} />)}</div>
      )}
    </Page>
  )
}

function GroupCard({ group }: { group: Group }) {
  return (
    <Link className="card group-card" to={`/groups/${group.id}`}>
      <GroupAvatar group={group} />
      <span className="grow">
        <strong>{group.name}</strong>
        <span className="muted small">{[group.sport, group.city, group.state].filter(Boolean).join(' · ') || 'Sports community'}</span>
        {group.description && <span className="muted small">{group.description}</span>}
      </span>
      <span className="card-arrow" aria-hidden="true">→</span>
    </Link>
  )
}

function GroupPage({ user }: { user: User | null }) {
  const { id = '' } = useParams()
  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<Array<{ id: string; role: string; profile: Profile | null }>>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      if (!supabase) {
        setError(configurationMessage)
        setLoading(false)
        return
      }
      const { data: groupData, error: groupError } = await supabase.from('groups').select('*').eq('id', id).maybeSingle()
      if (groupError) {
        if (active) { setError(`Unable to load group: ${groupError.message}`); setLoading(false) }
        return
      }
      if (!groupData) {
        if (active) { setError('Group not found.'); setLoading(false) }
        return
      }
      const groupRecord = groupData as Group
      const { data: memberData, error: memberError } = await supabase.from('group_members').select('user_id, role').eq('group_id', id)
      if (memberError) {
        if (active) { setError(`Unable to load group members: ${memberError.message}`); setLoading(false) }
        return
      }
      const membershipRows = (memberData ?? []) as Array<{ user_id: string; role: string }>
      const memberIds = [...new Set([...membershipRows.map((member) => member.user_id), ...(groupRecord.created_by ? [groupRecord.created_by] : [])])]
      let profiles: Profile[] = []
      if (memberIds.length) {
        const { data: profileData, error: profileError } = await supabase.from('profiles').select('id, username, full_name, avatar_url').in('id', memberIds)
        if (profileError) {
          if (active) { setError(`Unable to load member profiles: ${profileError.message}`); setLoading(false) }
          return
        }
        profiles = (profileData ?? []) as Profile[]
      }
      const currentMember = membershipRows.find((member) => member.user_id === user?.id)
      if (active) {
        setGroup(groupRecord)
        setMembers(memberIds.map((memberId) => ({
          id: memberId,
          role: memberId === groupRecord.created_by ? 'admin' : membershipRows.find((member) => member.user_id === memberId)?.role ?? 'member',
          profile: profiles.find((profile) => profile.id === memberId) ?? null,
        })))
        setIsAdmin(currentMember?.role === 'admin' || groupRecord.created_by === user?.id)
        setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [id, user?.id])

  if (loading) return <Page><Loading /></Page>
  if (error || !group) return <Page><ErrorMessage>{error || 'Group not found.'}</ErrorMessage><Link className="text-link" to="/groups">Back to groups</Link></Page>

  return (
    <Page>
      <Link className="back-link" to="/groups">← All groups</Link>
      <section className="card group-detail">
        <div className="group-detail-heading"><GroupAvatar group={group} large /><div className="grow">
          <h1>{group.name}</h1>
          <p className="muted">{[group.sport, group.city, group.state].filter(Boolean).join(' · ')}</p>
        </div>
          {isAdmin && <Link className="button primary" to={`/groups/${id}/events/new`}>Create event</Link>}
        </div>
        {group.description && <p className="group-description">{group.description}</p>}
      </section>
      <section className="section-block">
        <div className="section-heading"><h2>Members</h2><span className="count-pill">{members.length}</span></div>
        {members.length ? <div className="member-list">{members.map((member) => {
          const label = member.profile?.username || member.profile?.full_name || 'Member'
          return <div className="member-row" key={member.id}>
            <span className="avatar">{label.charAt(0).toUpperCase()}</span>
            <span className="grow"><strong>{label}</strong>{member.profile?.full_name && member.profile.full_name !== label && <span className="muted small">{member.profile.full_name}</span>}</span>
            <span className="muted small">{member.role}</span>
          </div>
        })}</div> : <Empty>No members yet.</Empty>}
      </section>
    </Page>
  )
}

function CreateGroupPage({ user }: { user: User | null }) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (!supabase) { setError(configurationMessage); return }
    if (!user) { setError('Sign in before creating a group.'); return }
    setBusy(true)
    const form = new FormData(event.currentTarget)
    const imageValue = String(form.get('image_url') ?? '').trim()
    let imageUrl: string | null = null
    if (imageValue) {
      try {
        const parsed = new URL(imageValue)
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') throw new Error()
        imageUrl = parsed.toString()
      } catch {
        setError('Enter a valid HTTP or HTTPS image URL.')
        setBusy(false)
        return
      }
    }
    const { data, error: insertError } = await supabase.from('groups').insert({
      name: String(form.get('name') ?? '').trim(),
      city: String(form.get('city') ?? '').trim(),
      state: canonicalizeState(String(form.get('state') ?? '')),
      sport: String(form.get('sport') ?? '').trim() || null,
      description: String(form.get('description') ?? '').trim() || null,
      image_url: imageUrl,
      created_by: user.id,
    }).select('id').single()
    if (insertError) {
      setError(`Unable to create group: ${insertError.message}`)
      setBusy(false)
      return
    }
    const { error: membershipError } = await supabase.from('group_members').insert({ group_id: data.id, user_id: user.id, role: 'admin' })
    if (membershipError) {
      setError(`Group created, but admin membership could not be saved: ${membershipError.message}`)
      setBusy(false)
      return
    }
    navigate(`/groups/${data.id}`)
  }

  return <Page narrow title="Create a group"><p className="muted">Start a community for your favorite sport.</p>
    <form className="form-stack card form-card" onSubmit={(event) => void submit(event)}>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {!user && <p className="muted small">You need to <Link className="text-link" to="/login">sign in</Link> before creating a group.</p>}
      <Field label="Group name"><input name="name" required maxLength={100} /></Field>
      <div className="field-row"><Field label="City"><input name="city" required maxLength={100} /></Field><Field label="State"><input name="state" required maxLength={100} /></Field></div>
      <Field label="Sport"><input name="sport" placeholder="e.g. Basketball" /></Field>
      <Field label="Group image URL (optional)"><input name="image_url" type="url" placeholder="https://example.com/image.jpg" /></Field>
      <Field label="Description"><textarea name="description" rows={4} /></Field>
      <button className="button primary" disabled={busy || !user}>{busy ? 'Creating...' : 'Create group'}</button>
    </form>
    <Link className="back-link" to="/groups">← Back to groups</Link>
  </Page>
}

function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      if (!supabase) { setError(configurationMessage); setLoading(false); return }
      const now = new Date()
      const { data, error: queryError } = await supabase.from('events').select('*')
        .or(`start_time.gte.${now.toISOString()},and(is_recurring.eq.true,or(recurrence_end_date.is.null,recurrence_end_date.gte.${now.toISOString().slice(0, 10)}))`)
        .order('start_time', { ascending: true })
      if (queryError) {
        if (active) { setError(`Unable to load events: ${queryError.message}`); setLoading(false) }
        return
      }
      const records = (data ?? []) as Event[]
      const groupIds = [...new Set(records.map((event) => event.group_id))]
      let groups: Group[] = []
      if (groupIds.length) {
        const { data: groupData, error: groupError } = await supabase.from('groups').select('id, name, city, state, sport, image_url').in('id', groupIds)
        if (groupError) {
          if (active) { setError(`Unable to load event groups: ${groupError.message}`); setLoading(false) }
          return
        }
        groups = (groupData ?? []) as Group[]
      }
      const byId = new Map(groups.map((group) => [group.id, group]))
      if (active) {
        setEvents(records.map((event) => ({ ...event, group: byId.get(event.group_id) ?? null })))
        setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [])

  return <Page title="Upcoming events"><p className="muted">Find your next game, practice, or pickup session.</p>
    {error ? <ErrorMessage>{error}</ErrorMessage> : loading ? <Loading /> : events.length ? <div className="list-stack">{events.map((event) => <EventCard key={event.id} event={event} />)}</div> : <Empty>No upcoming events yet. Visit a group page to see its schedule or create an event.</Empty>}
  </Page>
}

function EventCard({ event }: { event: Event }) {
  return (
    <article className="card event-card">
      <div className="event-card-heading"><div className="grow">
        <Link className="event-title" to={`/events/${event.id}`}>{event.title}</Link>
        {event.group ? <Link className="group-link" to={`/groups/${event.group.id}`}>{event.group.name}{event.group.city && event.group.state ? ` · ${event.group.city}, ${event.group.state}` : ''}</Link> : <span className="muted small">Group details unavailable</span>}
      </div><span className="tag">{event.event_type}</span></div>
      <p className="event-time">{formatTime(event.start_time)}</p>
      <div className="tag-row"><span className="tag">{event.skill_level}</span><span className="tag">{event.event_style}</span></div>
      {event.is_recurring && <p className="muted small">Repeats weekly: {event.recurrence_days.join(', ')}{event.recurrence_end_date ? ` · Until ${formatDate(event.recurrence_end_date)}` : ' · No end date'}</p>}
      {(event.venue_address || event.city || event.state) && <p className="muted small">{[event.venue_address, event.city, event.state].filter(Boolean).join(' · ')}</p>}
      {event.max_players && <p className="muted small">Capacity: {event.max_players} players</p>}
    </article>
  )
}

function EventPage({ user }: { user: User | null }) {
  const { id = '' } = useParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [rsvpCount, setRsvpCount] = useState(0)
  const [hasRsvped, setHasRsvped] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      if (!supabase) { setError(configurationMessage); setLoading(false); return }
      const { data, error: eventError } = await supabase.from('events').select('*').eq('id', id).maybeSingle()
      if (eventError) { if (active) { setError(`Unable to load event: ${eventError.message}`); setLoading(false) }; return }
      if (!data) { if (active) { setError('Event not found.'); setLoading(false) }; return }
      const record = data as Event
      const [{ data: group, error: groupError }, { data: count, error: countError }] = await Promise.all([
        supabase.from('groups').select('id, name, city, state, sport, image_url').eq('id', record.group_id).maybeSingle(),
        supabase.rpc('event_rsvp_count', { p_event_id: id }),
      ])
      if (groupError || countError) {
        if (active) { setError(`Unable to load event details: ${(groupError ?? countError)?.message}`); setLoading(false) }
        return
      }
      let rsvped = false
      if (user) {
        const { data: rsvp, error: rsvpError } = await supabase.from('event_rsvps').select('event_id').eq('event_id', id).eq('user_id', user.id).maybeSingle()
        if (rsvpError) { if (active) { setError(`Unable to load your RSVP: ${rsvpError.message}`); setLoading(false) }; return }
        rsvped = Boolean(rsvp)
      }
      if (active) {
        setEvent({ ...record, group: group as Group | null })
        setRsvpCount(Number(count ?? 0))
        setHasRsvped(rsvped)
        setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [id, user?.id])

  async function updateRsvp(action: 'rsvp' | 'cancel') {
    if (!supabase || !user) { setError('Sign in to manage your RSVP.'); return }
    setBusy(true)
    setError('')
    const result = action === 'rsvp'
      ? await supabase.rpc('rsvp_to_event', { p_event_id: id })
      : await supabase.from('event_rsvps').delete().eq('event_id', id).eq('user_id', user.id)
    if (result.error) setError(`Unable to ${action === 'rsvp' ? 'RSVP' : 'cancel RSVP'}: ${result.error.message}`)
    else {
      setHasRsvped(action === 'rsvp')
      setRsvpCount((count) => Math.max(0, count + (action === 'rsvp' ? 1 : -1)))
    }
    setBusy(false)
  }

  if (loading) return <Page><Loading /></Page>
  if (error && !event) return <Page><ErrorMessage>{error}</ErrorMessage><Link className="text-link" to="/events">Back to events</Link></Page>
  if (!event) return null
  const rsvpOpen = event.is_recurring ? !event.recurrence_end_date || event.recurrence_end_date >= new Date().toISOString().slice(0, 10) : new Date(event.start_time).getTime() > Date.now()

  return <Page narrow><Link className="back-link" to="/events">← Back to events</Link>
    <article className="card event-detail">
      <div className="eyebrow">Event details</div>
      <div className="event-card-heading"><h1>{event.title}</h1><span className="tag">{event.event_type}</span></div>
      {event.group && <p className="muted">Hosted by <Link className="text-link" to={`/groups/${event.group.id}`}>{event.group.name}</Link>{event.group.city && event.group.state ? ` · ${event.group.city}, ${event.group.state}` : ''}</p>}
      {event.group?.sport && <p className="muted small">{event.group.sport}</p>}
      <p className="event-time">{formatTime(event.start_time)}</p>
      <div className="tag-row"><span className="tag">{event.skill_level}</span><span className="tag">{event.event_style}</span></div>
      {event.is_recurring && <p className="muted">Repeats weekly: {event.recurrence_days.join(', ')}{event.recurrence_end_date ? ` · Until ${formatDate(event.recurrence_end_date)}` : ' · No end date'} <span className="small">· RSVP applies to the recurring series</span></p>}
      {event.venue_address && <p className="muted">{event.venue_address}</p>}
      {(event.city || event.state) && <p className="muted">{[event.city, event.state].filter(Boolean).join(', ')}</p>}
      <div className="rsvp-panel"><div><h2>RSVP</h2><p className="muted">{rsvpCount}{event.max_players ? ` / ${event.max_players}` : ''} {rsvpCount === 1 ? 'player' : 'players'} attending</p></div>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {user ? hasRsvped ? <button className="button secondary" disabled={busy} onClick={() => void updateRsvp('cancel')}>Cancel RSVP</button> : rsvpOpen ? <button className="button primary" disabled={busy || (event.max_players !== null && rsvpCount >= event.max_players)} onClick={() => void updateRsvp('rsvp')}>{busy ? 'Saving...' : 'RSVP'}</button> : <span className="muted small">RSVPs are closed.</span> : rsvpOpen ? <Link className="button primary" to="/login">Sign in to RSVP</Link> : <span className="muted small">RSVPs are closed.</span>}
      </div>
    </article>
  </Page>
}

function CreateEventPage({ user }: { user: User | null }) {
  const { id = '' } = useParams()
  const [group, setGroup] = useState<Group | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [recurring, setRecurring] = useState(false)
  const [noEndDate, setNoEndDate] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    async function load() {
      if (!supabase) { setError(configurationMessage); return }
      const { data, error: groupError } = await supabase.from('groups').select('id, name, created_by').eq('id', id).maybeSingle()
      if (groupError || !data) { if (active) setError(groupError ? `Unable to load group: ${groupError.message}` : 'Group not found.'); return }
      const groupData = data as Group
      let admin = Boolean(user && groupData.created_by === user.id)
      if (user && !admin) {
        const { data: membership, error: memberError } = await supabase.from('group_members').select('role').eq('group_id', id).eq('user_id', user.id).maybeSingle()
        if (memberError) { if (active) setError(`Unable to verify group membership: ${memberError.message}`); return }
        admin = (membership as { role: string } | null)?.role === 'admin'
      }
      if (active) { setGroup(groupData); setIsAdmin(admin) }
    }
    void load()
    return () => { active = false }
  }, [id, user?.id])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (!supabase) { setError(configurationMessage); return }
    if (!user) { setError('Sign in before creating an event.'); return }
    if (!isAdmin) { setError('Only group admins can create events.'); return }
    setBusy(true)
    const form = new FormData(event.currentTarget)
    const localStart = String(form.get('start_time') ?? '')
    const days = form.getAll('recurrence_days').map(String)
    const isRecurring = form.get('is_recurring') === 'true'
    const endDate = String(form.get('recurrence_end_date') ?? '') || null
    if (!localStart || Number.isNaN(new Date(localStart).getTime())) {
      setError('Enter a valid event date and time.')
      setBusy(false)
      return
    }
    if (isRecurring && !days.length) {
      setError('Choose at least one day for the recurring event.')
      setBusy(false)
      return
    }
    if (isRecurring && !days.includes(new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date(localStart)))) {
      setError('The first event date must match one of the selected weekdays.')
      setBusy(false)
      return
    }
    if (isRecurring && endDate && endDate < localStart.slice(0, 10)) {
      setError('Choose an end date on or after the event start date.')
      setBusy(false)
      return
    }
    const { error: insertError } = await supabase.from('events').insert({
      group_id: id,
      title: String(form.get('title') ?? '').trim(),
      skill_level: String(form.get('skill_level')),
      event_style: String(form.get('event_style')),
      event_type: String(form.get('event_type')),
      start_time: new Date(localStart).toISOString(),
      city: String(form.get('city') ?? '').trim(),
      state: canonicalizeState(String(form.get('state') ?? '')),
      is_recurring: isRecurring,
      recurrence_days: isRecurring ? days : [],
      recurrence_end_date: isRecurring ? endDate : null,
    })
    if (insertError) { setError(`Unable to create event: ${insertError.message}`); setBusy(false); return }
    navigate(`/groups/${id}`)
  }

  return <Page narrow title="Create an event">{group && <p className="muted">For <Link className="text-link" to={`/groups/${id}`}>{group.name}</Link></p>}
    {error && <ErrorMessage>{error}</ErrorMessage>}
    {!user && <p className="muted small">You need to <Link className="text-link" to="/login">sign in</Link> before creating an event.</p>}
    {user && group && !isAdmin && <p className="muted small">Only group admins can create events.</p>}
    <form className="form-stack card form-card" onSubmit={(event) => void submit(event)}>
      <Field label="Title"><input name="title" required maxLength={150} /></Field>
      <Field label="Skill level"><select name="skill_level"><option>Beginner</option><option>Intermediate</option><option>Experienced</option></select></Field>
      <Field label="Event style"><select name="event_style"><option>Casual</option><option>Competitive</option><option>Tournament</option></select></Field>
      <Field label="Event type"><select name="event_type"><option>Pick Up</option><option>Practice</option><option>Game</option><option>Info</option></select></Field>
      <Field label="Date and time"><input name="start_time" type="datetime-local" required /></Field>
      <div className="field-row"><Field label="City"><input name="city" required /></Field><Field label="State"><input name="state" required /></Field></div>
      <label className="check-label"><input name="is_recurring" type="checkbox" value="true" checked={recurring} onChange={(event) => setRecurring(event.target.checked)} /> Repeat weekly</label>
      {recurring && <fieldset className="recurrence-fields"><legend>Repeat options</legend>
        <div className="weekday-grid">{weekdays.map((day) => <label className="check-label" key={day}><input name="recurrence_days" type="checkbox" value={day} />{day}</label>)}</div>
        <label className="check-label"><input type="checkbox" checked={noEndDate} onChange={(event) => setNoEndDate(event.target.checked)} /> No end date</label>
        {!noEndDate && <Field label="Repeat until"><input type="date" name="recurrence_end_date" required /></Field>}
      </fieldset>}
      <button className="button primary" disabled={busy || !user || !isAdmin}>{busy ? 'Creating...' : 'Create event'}</button>
    </form>
    <Link className="back-link" to={`/groups/${id}`}>← Back to group</Link>
  </Page>
}

function FeedPage({ user }: { user: User | null }) {
  const [events, setEvents] = useState<Event[]>([])
  const [location, setLocation] = useState<{ city: string | null; state: string | null } | null>(null)
  const [feed, setFeed] = useState<'local' | 'sport' | 'popular'>('local')
  const [sport, setSport] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      if (!supabase) { setError(configurationMessage); setLoading(false); return }
      if (user) {
        const { data: settings, error: settingsError } = await supabase.from('account_settings').select('city, state').eq('user_id', user.id).maybeSingle()
        if (settingsError) { if (active) { setError(`Unable to load your feed location: ${settingsError.message}`); setLoading(false) }; return }
        if (active) setLocation(settings)
      } else if (active) setLocation(null)
      const now = new Date()
      const { data, error: eventError } = await supabase.from('events').select('*')
        .or(`start_time.gte.${now.toISOString()},and(is_recurring.eq.true,or(recurrence_end_date.is.null,recurrence_end_date.gte.${now.toISOString().slice(0, 10)}))`)
        .order('start_time', { ascending: true })
      if (eventError) { if (active) { setError(`Unable to load feed events: ${eventError.message}`); setLoading(false) }; return }
      const records = (data ?? []) as Event[]
      const groupIds = [...new Set(records.map((event) => event.group_id))]
      let groups: Group[] = []
      if (groupIds.length) {
        const { data: groupData, error: groupError } = await supabase.from('groups').select('id, name, city, state, sport, image_url').in('id', groupIds)
        if (groupError) { if (active) { setError(`Unable to load feed groups: ${groupError.message}`); setLoading(false) }; return }
        groups = (groupData ?? []) as Group[]
      }
      const groupById = new Map(groups.map((group) => [group.id, group]))
      const ids = records.map((event) => event.id)
      let counts: Array<{ event_id: string; rsvp_count: number }> = []
      if (ids.length) {
        const { data: countData, error: countError } = await supabase.rpc('event_rsvp_counts', { p_event_ids: ids })
        if (countError) { if (active) { setError(`Unable to load event popularity: ${countError.message}`); setLoading(false) }; return }
        counts = (countData ?? []) as Array<{ event_id: string; rsvp_count: number }>
      }
      const countById = new Map(counts.map((row) => [row.event_id, row.rsvp_count]))
      if (active) {
        setEvents(records.map((event) => ({ ...event, group: groupById.get(event.group_id) ?? null, rsvpCount: countById.get(event.id) ?? 0 })))
        setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [user?.id])

  const sports = [...new Set(events.map((event) => event.group?.sport?.trim()).filter((value): value is string => Boolean(value)))].sort()
  const filtered = events.filter((event) => {
    if (feed === 'local') return Boolean(location?.city && location.state)
      && (event.city || event.group?.city || '').trim().toLowerCase() === location?.city?.trim().toLowerCase()
      && normalizeState(event.state || event.group?.state) === normalizeState(location?.state)
    if (feed === 'sport') return Boolean(event.group?.sport) && (!sport || event.group?.sport?.toLowerCase() === sport.toLowerCase())
    return true
  })
  const shown = feed === 'popular' ? [...filtered].sort((a, b) => (b.rsvpCount ?? 0) - (a.rsvpCount ?? 0) || a.start_time.localeCompare(b.start_time)) : filtered

  return <Page title="Event feed"><p className="muted">Discover local games, sports, and popular events.</p>
    <div className="feed-tabs" role="tablist" aria-label="Choose event feed">
      {(['local', 'sport', 'popular'] as const).map((value) => <button key={value} type="button" role="tab" aria-selected={feed === value} className={feed === value ? 'active' : ''} onClick={() => setFeed(value)}>{value[0].toUpperCase() + value.slice(1)}</button>)}
    </div>
    {feed === 'local' && location?.city && location.state && <p className="feed-location">{location.city}, {location.state}</p>}
    {feed === 'sport' && <Field label="Filter by sport"><select value={sport} onChange={(event) => setSport(event.target.value)}><option value="">All sports</option>{sports.map((value) => <option key={value}>{value}</option>)}</select></Field>}
    {feed === 'local' && (!location?.city || !location.state) && <Empty>Set your city and state in <Link className="text-link" to={user ? '/profile' : '/login'}>{user ? 'your profile' : 'your account'}</Link> to see local events.</Empty>}
    {error ? <ErrorMessage>{error}</ErrorMessage> : loading ? <Loading /> : feed === 'local' && (!location?.city || !location.state) ? null : shown.length ? <div className="list-stack">{shown.map((event) => <EventCard key={event.id} event={event} />)}</div> : <Empty>{feed === 'sport' && !sports.length ? 'No sports have events yet.' : 'No events match this feed yet. Try another feed or check back later.'}</Empty>}
  </Page>
}

function ProfilePage({ user }: { user: User | null }) {
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
    else setMessage('Location saved.')
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

function SettingsPage() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') ?? 'system')
  useEffect(() => {
    const dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.classList.toggle('dark', dark)
    if (theme === 'system') localStorage.removeItem('theme')
    else localStorage.setItem('theme', theme)
  }, [theme])
  return <Page title="Settings"><section className="settings-card card"><Field label="Theme"><select value={theme} onChange={(event) => setTheme(event.target.value)}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></Field><p className="muted small">Choose how RecSquad looks on this device.</p></section></Page>
}

function Page({ title, children, action, narrow = false }: { title?: string; children: ReactNode; action?: ReactNode; narrow?: boolean }) {
  return <section className={`page ${narrow ? 'page-narrow' : ''}`}>
    {(title || action) && <header className="page-heading">{title && <h1>{title}</h1>}{action}</header>}
    {children}
  </section>
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="field"><span>{label}</span>{children}</label>
}

function ErrorMessage({ children }: { children: ReactNode }) {
  return <p className="error-message" role="alert">{children}</p>
}

function Empty({ children }: { children: ReactNode }) {
  return <div className="empty-state">{children}</div>
}

function Loading() {
  return <p className="muted loading-state" role="status">Loading...</p>
}

function GroupAvatar({ group, large = false }: { group: Group; large?: boolean }) {
  return group.image_url
    ? <img className={`avatar ${large ? 'avatar-large' : ''}`} src={group.image_url} alt="" />
    : <span className={`avatar ${large ? 'avatar-large' : ''}`}>{group.name.trim().charAt(0).toUpperCase()}</span>
}

function NotFoundPage() {
  return <Page title="Page not found"><p className="muted">The page you’re looking for doesn’t exist.</p><Link className="text-link" to="/">Go to home <span aria-hidden="true">→</span></Link></Page>
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'UTC', timeZoneName: 'short' }).format(new Date(value))
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`))
}

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const configurationMessage = 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.'

export default App
