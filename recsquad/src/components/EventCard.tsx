import { Link } from 'react-router-dom'
import { formatDate, formatTime } from '../lib/format'
import type { Event } from '../types'

export function EventCard({ event }: { event: Event }) {
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
