import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Empty, ErrorMessage, Field, Loading, Page } from '../components/shared'
import { EventCard } from '../components/EventCard'
import { getCachedData, invalidateCachedData, invalidateCachedDataPrefix } from '../lib/dataCache'
import { canonicalizeState } from '../lib/location'
import { configurationMessage, loadUpcomingEvents, weekdays } from '../lib/pageData'
import { formatDate, formatTime } from '../lib/format'
import { supabase } from '../lib/supabase'
import type { Event, Group, User } from '../types'

export function EventsPage() {
  const [events, setEvents] = useState<Event[]>(() => getCachedData<Event[]>('upcoming-events') ?? [])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(() => getCachedData<Event[]>('upcoming-events') === undefined)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const data = await loadUpcomingEvents()
        if (active) { setEvents(data); setError(''); setLoading(false) }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : String(loadError))
          setLoading(false)
        }
      }
    }
    void load()
    return () => { active = false }
  }, [])

  return <Page title="Upcoming events"><p className="muted">Find your next game, practice, or pickup session.</p>
    {error && events.length === 0 ? <ErrorMessage>{error}</ErrorMessage> : <>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {loading ? <Loading /> : events.length ? <div className="list-stack">{events.map((event) => <EventCard key={event.id} event={event} />)}</div> : <Empty>No upcoming events yet. Visit a group page to see its schedule or create an event.</Empty>}
    </>}
  </Page>
}

export function EventPage({ user }: { user: User | null }) {
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
      invalidateCachedDataPrefix('feed:')
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

export function CreateEventPage({ user }: { user: User | null }) {
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
    invalidateCachedData('upcoming-events')
    invalidateCachedDataPrefix('feed:')
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
