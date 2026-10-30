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

<main class="profile-page">
  <h1 class="page-title">Profile</h1>
  {#if user}
    <div class="profile-summary">
      {#if avatarUrl}
        <img src={avatarUrl} alt="Profile" class="profile-avatar" />
      {:else}
        <div class="profile-avatar avatar-initial">{initial}</div>
      {/if}
      <div class="profile-details">
        <p class="profile-name">{username || user.email}</p>
        <p class="profile-full-name">{fullName}</p>
      </div>
    </div>
  {:else}
    <p class="signed-out-message">Not signed in.</p>
  {/if}
</main>

<style>
  .profile-page {
    max-width: 28rem;
    margin: 0 auto;
    padding: 1.5rem;
  }

  .page-title {
    margin-bottom: 1rem;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .profile-summary {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .profile-avatar {
    width: 4rem;
    height: 4rem;
    border-radius: 9999px;
    object-fit: cover;
  }

  .avatar-initial {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #059669;
    color: #fff;
    font-size: 1.25rem;
    font-weight: 500;
  }

  .profile-name {
    font-weight: 600;
  }

  .profile-full-name,
  .signed-out-message {
    font-size: 0.875rem;
    color: #71717a;
  }

  :global(.dark) .profile-full-name,
  :global(.dark) .signed-out-message {
    color: #a1a1aa;
  }
</style>
