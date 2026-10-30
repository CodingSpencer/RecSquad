<script lang="ts">
  import { onMount } from 'svelte'
  import { createClient } from '$lib/supabase/client'

  const supabase = createClient()
  let user: any = null
  let username = ''
  let fullName = ''
  let avatarUrl: string | null = null

  onMount(async () => {
    const { data } = await supabase.auth.getUser()
    user = data.user
    if (!user) return
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, full_name, avatar_url')
      .eq('id', user.id)
      .single()
    username = profile?.username ?? ''
    fullName = profile?.full_name ?? ''
    avatarUrl = profile?.avatar_url ?? null
  })

  const initial = (username || fullName || user?.email || '?').trim().charAt(0).toUpperCase()
</script>

<main class="max-w-md mx-auto p-6">
  <h1 class="text-2xl font-bold mb-4">Profile</h1>
  {#if user}
    <div class="flex items-center gap-4 mb-6">
      {#if avatarUrl}
        <img src={avatarUrl} alt="Profile" class="h-16 w-16 rounded-full object-cover" />
      {:else}
        <div class="h-16 w-16 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xl font-medium">{initial}</div>
      {/if}
      <div>
        <p class="font-semibold">{username || user.email}</p>
        <p class="text-sm text-zinc-500 dark:text-zinc-400">{fullName}</p>
      </div>
    </div>
  {:else}
    <p class="text-zinc-500">Not signed in.</p>
  {/if}
</main>
