<script lang="ts">
  import type { PageData } from './$types'

  export let data: PageData
  $: name = data.profile?.username || data.profile?.full_name || data.user?.email || '?'
  $: initial = name.trim().charAt(0).toUpperCase()
</script>

<main class="profile-page">
  <h1 class="page-title">Profile</h1>
  {#if data.user}
    <div class="profile-summary">
      {#if data.profile?.avatar_url}
        <img src={data.profile.avatar_url} alt="Profile" class="profile-avatar" />
      {:else}
        <div class="profile-avatar avatar-initial">{initial}</div>
      {/if}
      <div class="profile-details">
        <p class="profile-name">{name}</p>
        <p class="profile-full-name">{data.profile?.full_name}</p>
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
