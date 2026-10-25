'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function NewGroupPage() {
  const supabase = createClient()
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [sport, setSport] = useState('')
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return alert('Sign in first')
    const { data: group, error } = await supabase.from('groups').insert({ name, description, sport, created_by: user.id }).select().single()
    if (error) return alert(error.message)
    await supabase.from('group_members').insert({ group_id: group.id, user_id: user.id, role: 'admin' })
    router.push(`/groups/${group.id}`)
  }
  return (
    <main className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Create Group</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="border w-full p-2 rounded" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} required />
        <input className="border w-full p-2 rounded" placeholder="Sport" value={sport} onChange={e=>setSport(e.target.value)} />
        <textarea className="border w-full p-2 rounded" placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />
        <button className="bg-emerald-600 text-white px-4 py-2 rounded">Create</button>
      </form>
    </main>
  )
}
