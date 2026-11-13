export type User = { id: string; email?: string }

export type Profile = {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
}

export type Group = {
  id: string
  name: string
  city: string | null
  state: string | null
  sport: string | null
  description?: string | null
  image_url?: string | null
  created_by?: string | null
}

export type Event = {
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

export type FeedData = {
  events: Event[]
  location: { city: string | null; state: string | null } | null
}
