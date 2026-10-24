'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

export default function NavbarClient({ initialLoggedIn, initialUsername, initialAvatarUrl, initialInitial }: { initialLoggedIn: boolean; initialUsername: string; initialAvatarUrl: string | null; initialInitial: string }) {
  const [loggedIn, setLoggedIn] = useState(initialLoggedIn)
  const [username, setUsername] = useState(initialUsername)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [initial, setInitial] = useState(initialInitial)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDropdown(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut({ scope: 'global' })
    localStorage.clear()
    window.location.href = '/'
  }

  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 border-b">
      <Link href="/" className="font-bold text-emerald-600">RecSquad</Link>
      <div className="flex items-center gap-6">
        <Link href="/" className="text-sm font-medium hover:text-emerald-600">Home</Link>
        <Link href="/events" className="text-sm font-medium hover:text-emerald-600">Events</Link>
      </div>
      {loggedIn ? (
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setShowDropdown((s) => !s)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{username || 'Profile'}</span>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <div className="h-9 w-9 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-medium">
                {initial}
              </div>
            )}
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-zinc-900 border rounded shadow-md z-10">
              <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">Profile</Link>
              <Link href="/settings" className="block px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">Settings</Link>
              <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">Log Out</button>
            </div>
          )}
        </div>
      ) : (
        <Link href="/login" className="text-sm font-medium text-emerald-600">Sign In</Link>
      )}
    </nav>
  )
}