import { fetchCachedData } from './dataCache'
import { supabase } from './supabase'
import type { Event, FeedData, Group } from '../types'

export const configurationMessage = 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.'

export const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function loadGroups() {
  return fetchCachedData('groups', async () => {
    if (!supabase) throw new Error(configurationMessage)
    const { data, error } = await supabase.from('groups').select('*').order('created_at', { ascending: false })
    if (error) throw new Error(`Unable to load groups: ${error.message}`)
    return (data ?? []) as Group[]
  })
}

export function loadUpcomingEvents() {
  return fetchCachedData('upcoming-events', async () => {
    if (!supabase) throw new Error(configurationMessage)
    const now = new Date()
    const { data, error } = await supabase.from('events').select('*')
      .or(`start_time.gte.${now.toISOString()},and(is_recurring.eq.true,or(recurrence_end_date.is.null,recurrence_end_date.gte.${now.toISOString().slice(0, 10)}))`)
      .order('start_time', { ascending: true })
    if (error) throw new Error(`Unable to load events: ${error.message}`)
    const records = (data ?? []) as Event[]
    const groupIds = [...new Set(records.map((event) => event.group_id))]
    let groups: Group[] = []
    if (groupIds.length) {
      const { data: groupData, error: groupError } = await supabase.from('groups').select('id, name, city, state, sport, image_url').in('id', groupIds)
      if (groupError) throw new Error(`Unable to load event groups: ${groupError.message}`)
      groups = (groupData ?? []) as Group[]
    }
    const byId = new Map(groups.map((group) => [group.id, group]))
    return records.map((event) => ({ ...event, group: byId.get(event.group_id) ?? null }))
  })
}

export function loadFeedData(userId: string | null) {
  const key = `feed:${userId ?? 'anonymous'}`
  return fetchCachedData<FeedData>(key, async () => {
    if (!supabase) throw new Error(configurationMessage)
    let location: FeedData['location'] = null
    if (userId) {
      const { data, error } = await supabase.from('account_settings').select('city, state').eq('user_id', userId).maybeSingle()
      if (error) throw new Error(`Unable to load your feed location: ${error.message}`)
      location = data
    }
    const now = new Date()
    const { data, error } = await supabase.from('events').select('*')
      .or(`start_time.gte.${now.toISOString()},and(is_recurring.eq.true,or(recurrence_end_date.is.null,recurrence_end_date.gte.${now.toISOString().slice(0, 10)}))`)
      .order('start_time', { ascending: true })
    if (error) throw new Error(`Unable to load feed events: ${error.message}`)
    const records = (data ?? []) as Event[]
    const groupIds = [...new Set(records.map((event) => event.group_id))]
    let groups: Group[] = []
    if (groupIds.length) {
      const { data: groupData, error: groupError } = await supabase.from('groups').select('id, name, city, state, sport, image_url').in('id', groupIds)
      if (groupError) throw new Error(`Unable to load feed groups: ${groupError.message}`)
      groups = (groupData ?? []) as Group[]
    }
    const groupById = new Map(groups.map((group) => [group.id, group]))
    const ids = records.map((event) => event.id)
    let counts: Array<{ event_id: string; rsvp_count: number }> = []
    if (ids.length) {
      const { data: countData, error: countError } = await supabase.rpc('event_rsvp_counts', { p_event_ids: ids })
      if (countError) throw new Error(`Unable to load event popularity: ${countError.message}`)
      counts = (countData ?? []) as Array<{ event_id: string; rsvp_count: number }>
    }
    const countById = new Map(counts.map((row) => [row.event_id, row.rsvp_count]))
    return {
      events: records.map((event) => ({ ...event, group: groupById.get(event.group_id) ?? null, rsvpCount: countById.get(event.id) ?? 0 })),
      location,
    }
  })
}

export function prefetchPageData<T>(request: Promise<T>, pageName: string): void {
  void request.catch((error: unknown) => console.error(`Unable to prefetch ${pageName}:`, error))
}
