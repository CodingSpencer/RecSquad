'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function GroupDetailPage() {
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()
  const [group, setGroup] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  useEffect(() => {
    supabase.from('groups').select('*').eq('id', id).single().then(({ data }) => setGroup(data))
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('group_members').select('role').eq('group_id', id).eq('user_id', user.id).single().then(({ data }) => setIsAdmin(data?.role === 'admin'))
    })
  }, [id])
  if (!group) return <main className="p-8">Loading...</main>
  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold">{group.name}</h1>
      <p className="text-zinc-500">{group.sport} · {group.description}</p>
      {isAdmin && (
        <Link href={`/groups/${id}/events/new`} className="inline-block mt-4 bg-emerald-600 text-white px-4 py-2 rounded">Create Event</Link>
      )}
    </main>
  )
}
