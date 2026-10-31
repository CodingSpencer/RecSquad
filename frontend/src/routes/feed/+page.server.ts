import type { PageServerLoad } from './$types'
import { error } from '@sveltejs/kit'

export const load: PageServerLoad = async ({ locals }) => {
  const { user } = await locals.safeGetSession()
  let location: { city: string | null; state: string | null } | null = null

  if (user) {
    const { data, error: profileError } = await locals.supabase
      .from('account_settings')
      .select('city, state')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profileError) {
      throw error(500, `Unable to load your feed location: ${profileError.message}`)
    }

    location = data
  }

  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  const { data: events, error: eventsError } = await locals.supabase
    .from('events')
    .select(
      'id, group_id, title, skill_level, event_style, event_type, start_time, city, state, is_recurring, recurrence_days, recurrence_end_date, max_players, venue_address'
    )
    .or(
      `start_time.gte.${now.toISOString()},and(is_recurring.eq.true,or(recurrence_end_date.is.null,recurrence_end_date.gte.${today}))`
    )
    .order('start_time', { ascending: true })

  if (eventsError) {
    throw error(500, `Unable to load feed events: ${eventsError.message}`)
  }

  const groupIds = [...new Set((events ?? []).map((event) => event.group_id))]
  let groups: {
    id: string
    name: string
    city: string | null
    state: string | null
    sport: string | null
    image_url: string | null
  }[] = []

  if (groupIds.length > 0) {
    const { data, error: groupsError } = await locals.supabase
      .from('groups')
      .select('id, name, city, state, sport, image_url')
      .in('id', groupIds)

    if (groupsError) {
      throw error(500, `Unable to load feed groups: ${groupsError.message}`)
    }

    groups = data ?? []
  }

  const groupsById = new Map(groups.map((group) => [group.id, group]))
  const eventIds = (events ?? []).map((event) => event.id)
  let rsvpCounts: { event_id: string; rsvp_count: number }[] = []

  if (eventIds.length > 0) {
    const { data, error: rsvpCountsError } = await locals.supabase.rpc(
      'event_rsvp_counts',
      { p_event_ids: eventIds }
    )

    if (rsvpCountsError) {
      throw error(500, `Unable to load event popularity: ${rsvpCountsError.message}`)
    }

    rsvpCounts = data ?? []
  }

  const rsvpCountsByEventId = new Map(
    rsvpCounts.map(({ event_id, rsvp_count }) => [event_id, rsvp_count])
  )

  return {
    location,
    isSignedIn: Boolean(user),
    events: (events ?? []).map((event) => ({
      ...event,
      group: groupsById.get(event.group_id) ?? null,
      rsvpCount: rsvpCountsByEventId.get(event.id) ?? 0
    }))
  }
}
