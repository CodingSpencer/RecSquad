import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, locals }) => {
  const id = params.id
  const { data: group } = await locals.supabase.from('groups').select('*').eq('id', id).single()

  let isAdmin = false
  const { data: { user } } = await locals.supabase.auth.getUser()
  if (user) {
    const { data: membership } = await locals.supabase
      .from('group_members')
      .select('role')
      .eq('group_id', id)
      .eq('user_id', user.id)
      .single()
    isAdmin = membership?.role === 'admin'
  }

  return { group, isAdmin, user }
}
