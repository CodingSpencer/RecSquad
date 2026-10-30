import type { Actions } from './$types'
import { redirect } from '@sveltejs/kit'

export const actions: Actions = {
  login: async ({ request, locals }) => {
    const formData = await request.formData()
    const email = (formData.get('email') as string)?.trim()
    const password = formData.get('password') as string

    const { error } = await locals.supabase.auth.signInWithPassword({ email, password })
    if (error) {
      return { error: error.message }
    }

    throw redirect(303, '/')
  },

  signup: async ({ request, locals }) => {
    const formData = await request.formData()
    const email = (formData.get('email') as string)?.trim()
    const password = formData.get('password') as string
    const username = (formData.get('username') as string)?.trim()
    const full_name = (formData.get('full_name') as string)?.trim()

    const { data, error } = await locals.supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, full_name }
      }
    })

    if (error) {
      return { error: error.message, mode: 'signup' }
    }

    if (data.user) {
      await locals.supabase.from('profiles').upsert({
        id: data.user.id,
        username,
        full_name,
        updated_at: new Date().toISOString()
      })
    }

    throw redirect(303, '/')
  }
}
