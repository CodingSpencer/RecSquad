import type { Actions } from './$types'
import { redirect } from '@sveltejs/kit'

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const formData = await request.formData()
    const readText = (key: string) => {
      const value = formData.get(key)
      return typeof value === 'string' ? value.trim() : ''
    }

    const name = readText('name')
    const city = readText('city')
    const state = readText('state')
    const description = readText('description')
    const sport = readText('sport')
    const imageUrlValue = readText('image_url')

    if (!name || !city || !state) {
      return { error: 'Enter a group name, city, and state' }
    }

    let imageUrl: string | null = null
    if (imageUrlValue) {
      try {
        const parsedImageUrl = new URL(imageUrlValue)
        if (parsedImageUrl.protocol !== 'https:' && parsedImageUrl.protocol !== 'http:') {
          return { error: 'Group profile image URL must use HTTP or HTTPS' }
        }
        imageUrl = parsedImageUrl.toString()
      } catch {
        return { error: 'Enter a valid group profile image URL' }
      }
    }

    const { data: { user } } = await locals.supabase.auth.getUser()
    if (!user) {
      return { error: 'Sign in first' }
    }

    const { data: group, error } = await locals.supabase
      .from('groups')
      .insert({
        name,
        city,
        state,
        description: description || null,
        sport: sport || null,
        image_url: imageUrl,
        created_by: user.id
      })
      .select()
      .single()
    if (error) {
      return { error: error.message }
    }

    const { error: membershipError } = await locals.supabase.from('group_members').insert({
      group_id: group.id,
      user_id: user.id,
      role: 'admin'
    })

    if (membershipError) {
      return { error: `Group created, but admin membership could not be saved: ${membershipError.message}` }
    }

    throw redirect(303, `/groups/${group.id}`)
  }
}
