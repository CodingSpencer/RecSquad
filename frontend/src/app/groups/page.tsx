'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function GroupsPage() {
  const supabase = createClient()
  const [groups, setGroups] = useState<any[]>([])
  useEffect(() => {
    supabase.from('groups').select('*').then(({ data }) => setGroups(data ?? []))
  }, [])
  return (
    <main className="max-w-3xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Groups</h1>
        <Link href="/groups/new" className="bg-emerald-600 text-white px-4 py-2 rounded">Create Group</Link>
      </div>
      <ul className="space-y-3">
        {groups.map((g) => (
          <li key={g.id} className="border rounded p-4">
            <Link href={`/groups/${g.id}`} className="font-semibold text-emerald-600">{g.name}</Link>
            <p className="text-sm text-zinc-500">{g.sport} · {g.description}</p>
          </li>
        ))}
      </ul>
    </main>
  )
}
