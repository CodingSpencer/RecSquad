import type { Actions } from './$types'
import { redirect } from '@sveltejs/kit'

export const actions: Actions = {
  default: async ({ request, params, locals }) => {
    const groupId = params.id
    const formData = await request.formData()
    const titleValue = formData.get('title')
    const skillLevelValue = formData.get('skill_level')
    const eventStyleValue = formData.get('event_style')
    const eventTypeValue = formData.get('event_type')
    const startTimeValue = formData.get('start_time')
    const cityValue = formData.get('city')
    const stateValue = formData.get('state')
    const timezoneOffsetValue = formData.get('timezone_offset')
    const isRecurring = formData.get('is_recurring') === 'true'
    const noEndDate = formData.get('no_end_date') === 'true'
    const recurrenceDays = formData.getAll('recurrence_days')
    const title = typeof titleValue === 'string' ? titleValue.trim() : ''
    const skillLevel = typeof skillLevelValue === 'string' ? skillLevelValue : ''
    const eventStyle = typeof eventStyleValue === 'string' ? eventStyleValue : ''
    const eventType = typeof eventTypeValue === 'string' ? eventTypeValue : ''
    const startTime = typeof startTimeValue === 'string' ? startTimeValue.trim() : ''
    const city = typeof cityValue === 'string' ? cityValue.trim() : ''
    const state = typeof stateValue === 'string' ? stateValue.trim() : ''
    const timezoneOffset = typeof timezoneOffsetValue === 'string'
      ? Number(timezoneOffsetValue)
      : Number.NaN

    if (!title) {
      return { error: 'Enter an event title' }
    }

    if (!city || !state) {
      return { error: 'Enter the event city and state' }
    }

    if (!['Beginner', 'Intermediate', 'Experienced'].includes(skillLevel)) {
      return { error: 'Choose a valid skill level' }
    }

    if (!['Casual', 'Competitive', 'Tournament'].includes(eventStyle)) {
      return { error: 'Choose a valid event style' }
    }

    if (!['Pick Up', 'Practice', 'Game', 'Info'].includes(eventType)) {
      return { error: 'Choose a valid event type' }
    }

    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(startTime)) {
      return { error: 'Enter a valid event date and time' }
    }

    if (!Number.isInteger(timezoneOffset) || Math.abs(timezoneOffset) > 840) {
      return { error: 'Unable to determine your time zone. Refresh the page and try again.' }
    }

    const localDateAsUtc = new Date(`${startTime}:00Z`)
    if (
      Number.isNaN(localDateAsUtc.getTime()) ||
      localDateAsUtc.toISOString().slice(0, 16) !== startTime
    ) {
      return { error: 'Enter a valid event date and time' }
    }
    const localStartDate = startTime.slice(0, 10)
    const utcStartTime = new Date(
      localDateAsUtc.getTime() + timezoneOffset * 60_000
    ).toISOString()

    const validWeekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    if (
      recurrenceDays.some((day) => typeof day !== 'string' || !validWeekdays.includes(day)) ||
      new Set(recurrenceDays).size !== recurrenceDays.length
    ) {
      return { error: 'Choose valid days for the recurring event' }
    }

    let recurrenceEndDate: string | null = null
    if (isRecurring) {
      if (recurrenceDays.length === 0) {
        return { error: 'Choose at least one day for the recurring event' }
      }

      const startWeekday = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        timeZone: 'UTC'
      }).format(new Date(`${localStartDate}T00:00:00Z`))
      if (!recurrenceDays.includes(startWeekday)) {
        return { error: 'The first event date must match one of the selected weekdays' }
      }

      if (!noEndDate) {
        const recurrenceEndDateValue = formData.get('recurrence_end_date')
        recurrenceEndDate =
          typeof recurrenceEndDateValue === 'string' ? recurrenceEndDateValue : ''

        if (
          !/^\d{4}-\d{2}-\d{2}$/.test(recurrenceEndDate) ||
          recurrenceEndDate < localStartDate
        ) {
          return { error: 'Choose an end date on or after the event start date' }
        }

        const parsedEndDate = new Date(`${recurrenceEndDate}T00:00:00Z`)
        if (Number.isNaN(parsedEndDate.getTime()) || parsedEndDate.toISOString().slice(0, 10) !== recurrenceEndDate) {
          return { error: 'Enter a valid recurrence end date' }
        }
      }
    } else if (recurrenceDays.length > 0) {
      return { error: 'Choose whether this event repeats weekly' }
    }

    const { data: { user } } = await locals.supabase.auth.getUser()
    if (!user) {
      return { error: 'Sign in first' }
    }

    const { data: group, error: groupError } = await locals.supabase
      .from('groups')
      .select('created_by')
      .eq('id', groupId)
      .maybeSingle()

    if (groupError) {
      return { error: `Unable to verify group permissions: ${groupError.message}` }
    }
    if (!group) {
      return { error: 'Group not found' }
    }

    const { data: membership, error: membershipError } = await locals.supabase
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (membershipError) {
      return { error: `Unable to verify group membership: ${membershipError.message}` }
    }

    if (membership?.role !== 'admin' && group.created_by !== user.id) {
      return { error: 'Only group admins can create events' }
    }

    const { error } = await locals.supabase.from('events').insert({
      title,
      skill_level: skillLevel,
      event_style: eventStyle,
      event_type: eventType,
      city,
      state,
      is_recurring: isRecurring,
      recurrence_days: isRecurring ? recurrenceDays : [],
      recurrence_end_date: isRecurring ? recurrenceEndDate : null,
      start_time: utcStartTime,
      group_id: groupId
    })
    if (error) {
      return { error: error.message }
    }

    throw redirect(303, `/groups/${groupId}`)
  }
}
