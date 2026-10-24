'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function ProfilePage() {
  const supabase = createClient()
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [user, setUser] = useState<any>(null)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme') as any
    if (saved) setTheme(saved)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    if (theme !== 'system') localStorage.setItem('theme', theme)
    else localStorage.removeItem('theme')
  }, [theme])
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      setUser(user)
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url')
        .eq('id', user.id)
        .single()
      setUsername(profile?.username ?? '')
      setFullName(profile?.full_name ?? '')
      setAvatarUrl(profile?.avatar_url ?? null)
    })
  }, [])

  const initial = (username || fullName || user?.email || '?')
    .trim()
    .charAt(0)
    .toUpperCase()

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = async () => {
        const maxSize = 256
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        setAvatarUrl(dataUrl)
        await supabase.from('profiles').upsert({
          id: user.id,
          username,
          full_name: fullName,
          avatar_url: dataUrl,
          updated_at: new Date().toISOString(),
        })
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  }

  async function saveProfile() {
    if (!user) return
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      username,
      full_name: fullName,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })
    if (error) {
      console.error('Save profile failed:', error.message)
      alert('Save failed: ' + error.message)
    } else {
      console.log('Profile saved')
    }
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Please sign in to view your profile.</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-bold">Profile</h1>

      <div className="flex flex-col items-center gap-3">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="h-24 w-24 rounded-full object-cover border"
          />
        ) : (
          <div className="h-24 w-24 rounded-full bg-emerald-600 text-white flex items-center justify-center text-3xl font-bold">
            {initial}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-sm text-emerald-600 hover:underline"
        >
          Upload picture
        </button>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        <input
          value={username ?? ''}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="border rounded px-3 py-2"
        />
        <input
          value={fullName ?? ''}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full name"
          className="border rounded px-3 py-2"
        />
        <button
          onClick={saveProfile}
          className="bg-emerald-600 text-white rounded py-2 px-4 font-medium hover:bg-emerald-700 transition"
        >
          Save
        </button>
      </div>
    </main>
  )
}