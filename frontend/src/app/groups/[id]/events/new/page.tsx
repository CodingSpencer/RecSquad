'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useParams } from 'next/navigation'

export default function NewGroupEventPage() {
  const params = useParams()
  const groupId = params.id as string
  const supabase = createClient()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase.from('group_members').select('role').eq('group_id', groupId).eq('user_id', user.id).single()
      if (data?.role !== 'admin') alert('Only group admins can create events')
    })
  }, [groupId])
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return alert('Sign in first')
    const { data: m } = await supabase.from('group_members').select('role').eq('group_id', groupId).eq('user_id', user.id).single()
    if (m?.role !== 'admin') return alert('Only group admins can create events')
    const { error } = await supabase.from('events').insert({ title, date, group_id: groupId })
    if (error) return alert(error.message)
    router.push(`/groups/${groupId}`)
  }
  return (
    <main className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Create Event</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="border w-full p-2 rounded" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} required />
        <input type="datetime-local" className="border w-full p-2 rounded" value={date} onChange={e=>setDate(e.target.value)} required />
        <button className="bg-emerald-600 text-white px-4 py-2 rounded">Create</button>
      </form>
    </main>
  )
}
