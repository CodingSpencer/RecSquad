import type { Actions, PageServerLoad } from './$types'
import { error, fail, redirect } from '@sveltejs/kit'

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!uuidPattern.test(params.id)) {
    throw error(404, 'Event not found')
  }

  const { data: event, error: eventError } = await locals.supabase
    .from('events')
    .select(
      'id, group_id, title, skill_level, event_style, event_type, start_time, city, state, is_recurring, recurrence_days, recurrence_end_date, max_players, venue_address'
    )
    .eq('id', params.id)
    .maybeSingle()

  if (eventError) {
    throw error(500, `Unable to load event: ${eventError.message}`)
  }
  if (!event) {
    throw error(404, 'Event not found')
  }

  const { data: group, error: groupError } = await locals.supabase
    .from('groups')
    .select('id, name, city, state, sport, image_url')
    .eq('id', event.group_id)
    .maybeSingle()

  if (groupError) {
    throw error(500, `Unable to load event group: ${groupError.message}`)
  }

  const { data: rsvpCount, error: rsvpCountError } = await locals.supabase
    .rpc('event_rsvp_count', { p_event_id: event.id })

  if (rsvpCountError) {
    throw error(500, `Unable to load RSVP count: ${rsvpCountError.message}`)
  }

  const { user } = await locals.safeGetSession()
  let hasRsvped = false

  if (user) {
    const { data: rsvp, error: rsvpError } = await locals.supabase
      .from('event_rsvps')
      .select('event_id')
      .eq('event_id', event.id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (rsvpError) {
      throw error(500, `Unable to load your RSVP: ${rsvpError.message}`)
    }

    hasRsvped = Boolean(rsvp)
  }

  const today = new Date().toISOString().slice(0, 10)
  const rsvpOpen = event.is_recurring
    ? !event.recurrence_end_date || event.recurrence_end_date >= today
    : new Date(event.start_time).getTime() > Date.now()

  return {
    event,
    group,
    rsvpCount: rsvpCount ?? 0,
    hasRsvped,
    isSignedIn: Boolean(user),
    rsvpOpen
  }
}

export const actions: Actions = {
  rsvp: async ({ params, locals }) => {
    if (!uuidPattern.test(params.id)) {
      return fail(404, { error: 'Event not found' })
    }

    const { user } = await locals.safeGetSession()
    if (!user) {
      return fail(401, { error: 'Sign in to RSVP to this event.' })
    }

    const { error: rsvpError } = await locals.supabase.rpc('rsvp_to_event', {
      p_event_id: params.id
    })

    if (rsvpError) {
      return fail(400, { error: `Unable to RSVP: ${rsvpError.message}` })
    }

    throw redirect(303, `/events/${params.id}`)
  },

  cancel: async ({ params, locals }) => {
    if (!uuidPattern.test(params.id)) {
      return fail(404, { error: 'Event not found' })
    }

    const { user } = await locals.safeGetSession()
    if (!user) {
      return fail(401, { error: 'Sign in to manage your RSVP.' })
    }

    const { error: cancelError } = await locals.supabase
      .from('event_rsvps')
      .delete()
      .eq('event_id', params.id)
      .eq('user_id', user.id)

    if (cancelError) {
      return fail(400, { error: `Unable to cancel RSVP: ${cancelError.message}` })
    }

    throw redirect(303, `/events/${params.id}`)
  }
}
