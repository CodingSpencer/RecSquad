import type { Actions, PageServerLoad } from './$types'
import { getUsState } from '$lib/data/us-states'
import { fail, redirect } from '@sveltejs/kit'

export const load: PageServerLoad = async ({ locals }) => {
  const { user } = await locals.safeGetSession()
  if (!user) {
    return { location: null }
  }

  const { data: location, error: locationError } = await locals.supabase
    .from('account_settings')
    .select('city, state')
    .eq('user_id', user.id)
    .maybeSingle()

  if (locationError) {
    throw new Error(`Unable to load account location: ${locationError.message}`)
  }

  return { location }
}

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const { user } = await locals.safeGetSession()
    if (!user) {
      return fail(401, { error: 'Sign in to update your account location.' })
    }

    const formData = await request.formData()
    const cityValue = formData.get('city')
    const stateValue = formData.get('state')
    const city = typeof cityValue === 'string' ? cityValue.trim() : ''
    const stateInput = typeof stateValue === 'string' ? stateValue.trim() : ''
    const state = getUsState(stateInput)?.name ?? ''

    if (city.length > 100 || state.length > 100) {
      return fail(400, {
        error: 'City and state must be 100 characters or fewer.',
        city,
        state
      })
    }

    if (stateInput && !state) {
      return fail(400, {
        error: 'Choose a valid U.S. state.',
        city,
        state: stateInput
      })
    }

    if (Boolean(city) !== Boolean(state)) {
      return fail(400, {
        error: 'Enter both a city and state, or leave both blank.',
        city,
        state
      })
    }

    const { error: updateError } = await locals.supabase
      .from('account_settings')
      .upsert(
        {
          user_id: user.id,
          city: city || null,
          state: state || null,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id' }
      )

    if (updateError) {
      return fail(500, {
        error: `Unable to save account location: ${updateError.message}`,
        city,
        state
      })
    }

    return { success: 'Location saved.' }
  }
}
