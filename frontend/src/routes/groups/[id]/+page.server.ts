import type { PageServerLoad } from './$types'
import { error } from '@sveltejs/kit'

export const load: PageServerLoad = async ({ params, locals }) => {
  const id = params.id
  const { data: group, error: groupError } = await locals.supabase
    .from('groups')
    .select('id, name, city, state, sport, description, image_url, created_by')
    .eq('id', id)
    .maybeSingle()

  if (groupError) {
    throw error(500, `Unable to load group: ${groupError.message}`)
  }
  if (!group) {
    throw error(404, 'Group not found')
  }

  const { data: memberships, error: membersError } = await locals.supabase
    .from('group_members')
    .select('user_id, role')
    .eq('group_id', id)

  if (membersError) {
    throw error(500, `Unable to load group members: ${membersError.message}`)
  }

  const memberIds = new Set((memberships ?? []).map(({ user_id }) => user_id))
  if (group.created_by) {
    memberIds.add(group.created_by)
  }
  let profiles: { id: string; username: string | null; full_name: string | null; avatar_url: string | null }[] = []

  if (memberIds.size > 0) {
    const { data, error: profilesError } = await locals.supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', [...memberIds])

    if (profilesError) {
      throw error(500, `Unable to load member profiles: ${profilesError.message}`)
    }

    profiles = data ?? []
  }

  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]))
  const membersById = new Map((memberships ?? []).map(({ user_id, role }) => [user_id, role]))
  if (group.created_by) {
    membersById.set(group.created_by, 'admin')
  }
  const members = [...membersById].map(([user_id, role]) => {
    const profile = profilesById.get(user_id)
    return {
      id: user_id,
      role,
      name: profile?.username || profile?.full_name || 'Member',
      fullName: profile?.full_name,
      avatarUrl: profile?.avatar_url
    }
  })

  let isAdmin = false
  const { data: { user } } = await locals.supabase.auth.getUser()
  if (user) {
    const { data: membership } = await locals.supabase
      .from('group_members')
      .select('role')
      .eq('group_id', id)
      .eq('user_id', user.id)
      .single()
    isAdmin = membership?.role === 'admin' || group.created_by === user.id
  }

  return { group, members, isAdmin }
}
