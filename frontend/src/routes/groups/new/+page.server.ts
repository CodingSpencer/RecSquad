import type { Actions } from './$types'
import { redirect } from '@sveltejs/kit'

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const formData = await request.formData()
    const name = (formData.get('name') as string)?.trim()
    const description = (formData.get('description') as string)?.trim()
    const sport = (formData.get('sport') as string)?.trim()

    const { data: { user } } = await locals.supabase.auth.getUser()
    if (!user) {
      return { error: 'Sign in first' }
    }

    const { data: group, error } = await locals.supabase
      .from('groups')
      .insert({ name, description, sport, created_by: user.id })
      .select()
      .single()
    if (error) {
      return { error: error.message }
    }

    await locals.supabase.from('group_members').insert({
      group_id: group.id,
      user_id: user.id,
      role: 'admin'
    })

    throw redirect(303, `/groups/${group.id}`)
  }
}
