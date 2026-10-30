import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals }) => {
  const { user } = await locals.safeGetSession()

  if (!user) {
    return { user: null, profile: null }
  }

  const { data: profile, error } = await locals.supabase
    .from('profiles')
    .select('username, full_name, avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    throw new Error(`Unable to load the user profile: ${error.message}`)
  }

  return {
    user: { id: user.id, email: user.email },
    profile
  }
}
