import { createClient } from '@/utils/supabase/server'
import NavbarClient from './NavbarClient'

export default async function Navbar() {
  const { connection } = await import('next/server')
  await connection()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let username = ''
  let avatarUrl: string | null = null
  let initial = 'P'
  let loggedIn = false
  if (user) {
    loggedIn = true
    const { data: profile } = await supabase.from('profiles').select('username, full_name, avatar_url').eq('id', user.id).single()
    username = profile?.username ?? ''
    avatarUrl = profile?.avatar_url ?? null
    const name = username || profile?.full_name || user.email || '?'
    initial = name.trim().charAt(0).toUpperCase()
  }
  return <NavbarClient initialLoggedIn={loggedIn} initialUsername={username} initialAvatarUrl={avatarUrl} initialInitial={initial} />
}
