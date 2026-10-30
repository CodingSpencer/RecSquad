<script lang="ts">
  import { onMount } from 'svelte'
  import { createClient } from '$lib/supabase/client'
  import { goto } from '$app/navigation'

  type Session = NonNullable<App.PageData['session']>
  type User = Session['user']

  type Profile = {
    username: string | null
    full_name: string | null
    avatar_url: string | null
  }

  export let session: Session | null = null

  let supabase: ReturnType<typeof createClient>
  let user: User | null = session?.user ?? null
  let lastSessionUserId = session?.user?.id
  let profile: Profile | null = null
  let loggedIn = Boolean(user)
  let showDropdown = false
  let authError: string | null = null
  let initial = 'P'

  $: if (session?.user?.id !== lastSessionUserId) {
    lastSessionUserId = session?.user?.id
    user = session?.user ?? null
    loggedIn = Boolean(user)
    profile = null

    if (user && supabase) {
      const userId = user.id
      queueMicrotask(() => {
        if (user?.id === userId) void loadProfile(userId)
      })
    }
  }

  $: name = profile?.username || profile?.full_name || user?.email || 'Profile'
  $: avatarUrl = profile?.avatar_url ?? null
  $: initial = name.trim().charAt(0).toUpperCase() || '?'

  async function loadProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, full_name, avatar_url')
      .eq('id', userId)
      .single()

    if (user?.id !== userId) return

    if (error) {
      console.error('Unable to load the navbar profile:', error)
      profile = null
      return
    }

    profile = data
  }

  onMount(() => {
    supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      const nextUser = nextSession?.user ?? null
      const userChanged = nextUser?.id !== user?.id
      user = nextUser
      loggedIn = Boolean(user)

      if (userChanged) {
        profile = null
        authError = null
        showDropdown = false
      }

      if (user && userChanged) {
        const userId = user.id
        queueMicrotask(() => {
          if (user?.id === userId) void loadProfile(userId)
        })
      }
    })

    return () => subscription.unsubscribe()
  })

  async function handleLogout() {
    const { error } = await supabase.auth.signOut({ scope: 'global' })
    if (error) {
      console.error('Unable to sign out:', error)
      authError = 'Unable to sign out. Please try again.'
      return
    }

    user = null
    profile = null
    loggedIn = false
    showDropdown = false
    await goto('/')
  }
</script>

<nav class="w-full flex items-center justify-between px-4 py-4 border-b bg-white dark:bg-black">
  <a href="/" class="font-bold text-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-500">RecSquad</a>

  <div class="flex items-center gap-4">
    <a href="/" class="text-sm font-medium text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400">Home</a>
    <a href="/events" class="text-sm font-medium text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400">Events</a>
    <a href="/groups" class="text-sm font-medium text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400">Groups</a>
  </div>

  <div class="flex items-center gap-3">
    {#if loggedIn}
      <div class="relative">
        <button
          type="button"
          onclick={() => (showDropdown = !showDropdown)}
          aria-expanded={showDropdown}
          aria-haspopup="true"
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          <span class="text-sm font-medium text-zinc-700 dark:text-zinc-200">{name}</span>
          {#if avatarUrl}
            <img src={avatarUrl} alt="Profile" class="h-9 w-9 rounded-full object-cover" />
          {:else}
            <div class="h-9 w-9 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-medium">{initial}</div>
          {/if}
        </button>
        {#if showDropdown}
          <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded shadow-lg z-10">
            {#if authError}
              <p role="alert" class="px-4 py-2 text-sm text-red-600 dark:text-red-400">{authError}</p>
            {/if}
            <a href="/profile" class="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800">Profile</a>
            <a href="/settings" class="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800">Settings</a>
            <button type="button" onclick={handleLogout} class="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800">Log Out</button>
          </div>
        {/if}
      </div>
    {:else}
      <a href="/login" class="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">Sign In</a>
    {/if}
  </div>
</nav>

<style>
  nav a {
    transition: color 0.2s;
  }
</style>
