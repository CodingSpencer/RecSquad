import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const { data: groups } = await locals.supabase.from('groups').select('*').order('created_at', { ascending: false })
  return { groups: groups ?? [] }
}
