import type { Actions } from './$types'
import { redirect } from '@sveltejs/kit'

export const actions: Actions = {
  default: async ({ request, params, locals }) => {
    const groupId = params.id
    const formData = await request.formData()
    const title = (formData.get('title') as string)?.trim()
    const date = (formData.get('date') as string)?.trim()

    const { data: { user } } = await locals.supabase.auth.getUser()
    if (!user) {
      return { error: 'Sign in first' }
    }

    const { data: membership } = await locals.supabase
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single()
    if (membership?.role !== 'admin') {
      return { error: 'Only group admins can create events' }
    }

    const { error } = await locals.supabase.from('events').insert({
      title,
      date,
      group_id: groupId
    })
    if (error) {
      return { error: error.message }
    }

    throw redirect(303, `/groups/${groupId}`)
  }
}
