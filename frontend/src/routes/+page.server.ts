import type { Actions } from './$types'
import { redirect } from '@sveltejs/kit'

export const actions: Actions = {
  logout: async ({ locals }) => {
    const { error } = await locals.supabase.auth.signOut({ scope: 'global' })

    if (error) {
      throw new Error(`Unable to sign out: ${error.message}`)
    }

    throw redirect(303, '/')
  }
}
