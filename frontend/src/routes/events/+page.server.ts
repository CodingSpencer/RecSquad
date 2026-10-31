import type { PageServerLoad } from './$types'
import { error } from '@sveltejs/kit'

export const load: PageServerLoad = async ({ locals }) => {
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
    throw error(500, `Unable to load events: ${eventsError.message}`)
  }

  const groupIds = [...new Set((events ?? []).map((event) => event.group_id))]
  let groups: { id: string; name: string; city: string | null; state: string | null; sport: string | null }[] = []

  if (groupIds.length > 0) {
    const { data, error: groupsError } = await locals.supabase
      .from('groups')
      .select('id, name, city, state, sport, image_url')
      .in('id', groupIds)

    if (groupsError) {
      throw error(500, `Unable to load event groups: ${groupsError.message}`)
    }

    groups = data ?? []
  }

  const groupsById = new Map(groups.map((group) => [group.id, group]))

  return {
    events: (events ?? []).map((event) => ({
      ...event,
      group: groupsById.get(event.group_id) ?? null
    }))
  }
}
