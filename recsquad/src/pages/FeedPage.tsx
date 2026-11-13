import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Empty, ErrorMessage, Field, Loading, Page } from '../components/shared'
import { EventCard } from '../components/EventCard'
import { getCachedData } from '../lib/dataCache'
import { normalizeState } from '../lib/location'
import { loadFeedData } from '../lib/pageData'
import type { FeedData, User } from '../types'

export function FeedPage({ user }: { user: User | null }) {
  const feedCacheKey = `feed:${user?.id ?? 'anonymous'}`
  const [feedData, setFeedData] = useState<{ key: string; data: FeedData } | null>(() => {
    const data = getCachedData<FeedData>(feedCacheKey)
    return data ? { key: feedCacheKey, data } : null
  })
  const [feed, setFeed] = useState<'local' | 'sport' | 'popular'>('local')
  const [sport, setSport] = useState('')
  const [error, setError] = useState('')
  const data = feedData?.key === feedCacheKey ? feedData.data : getCachedData<FeedData>(feedCacheKey) ?? null
  const events = data?.events ?? []
  const location = data?.location ?? null
  const loading = data === null && !error

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const result = await loadFeedData(user?.id ?? null)
        if (active) { setFeedData({ key: feedCacheKey, data: result }); setError('') }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : String(loadError))
      }
    }
    void load()
    return () => { active = false }
  }, [feedCacheKey])

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
    <div className="feed-location-slot">
      {feed === 'local' && location?.city && location.state && <p className="feed-location">{location.city}, {location.state}</p>}
    </div>
    {feed === 'sport' && <Field label="Filter by sport"><select value={sport} onChange={(event) => setSport(event.target.value)}><option value="">All sports</option>{sports.map((value) => <option key={value}>{value}</option>)}</select></Field>}
    <div className="feed-results" aria-busy={loading}>
      {error && !data ? <ErrorMessage>{error}</ErrorMessage> : <>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {loading ? <Loading /> : feed === 'local' && (!location?.city || !location.state) ? <Empty>Set your city and state in <Link className="text-link" to={user ? '/profile' : '/login'}>{user ? 'your profile' : 'your account'}</Link> to see local events.</Empty> : shown.length ? <div className="list-stack">{shown.map((event) => <EventCard key={event.id} event={event} />)}</div> : <Empty>{feed === 'sport' && !sports.length ? 'No sports have events yet.' : 'No events match this feed yet. Try another feed or check back later.'}</Empty>}
      </>}
    </div>
  </Page>
}
