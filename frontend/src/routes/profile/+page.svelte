<script lang="ts">
  import { enhance } from '$app/forms'
  import { getUsState, US_STATES } from '$lib/data/us-states'
  import type { ActionData, PageData } from './$types'

  export let data: PageData
  export let form: ActionData
  $: name = data.profile?.username || data.profile?.full_name || data.user?.email || '?'
  $: initial = name.trim().charAt(0).toUpperCase()
  $: savedState = form?.state ?? data.location?.state ?? ''
  $: selectedState = getUsState(savedState)?.name ?? ''
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
    <form method="POST" use:enhance class="location-setting">
      <h2 class="section-title">Account location</h2>
      <p class="setting-description">Used to show events near you in the Local feed.</p>
      {#if form?.error}
        <p class="form-message error-message" role="alert">{form.error}</p>
      {:else if form?.success}
        <p class="form-message success-message" role="status">{form.success}</p>
      {/if}
      <label for="account-city" class="field-label">City</label>
      <input
        id="account-city"
        name="city"
        type="text"
        maxlength="100"
        autocomplete="address-level2"
        value={form?.city ?? data.location?.city ?? ''}
        class="location-input"
      />
      <label for="account-state" class="field-label">State</label>
      <select
        id="account-state"
        name="state"
        class="location-input"
        value={selectedState}
      >
        <option value="">Select a state</option>
        {#each US_STATES as state (state.abbreviation)}
          <option value={state.name}>{state.name}</option>
        {/each}
      </select>
      <button type="submit" class="save-button">Save Location</button>
    </form>
  {:else}
    <p class="signed-out-message">Not signed in.</p>
  {/if}
</main>

<style>
  .profile-page {
    max-width: 36rem;
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

  .location-setting {
    display: flex;
    max-width: 24rem;
    flex-direction: column;
    gap: 0.5rem;
  }

  .section-title {
    font-size: 1.125rem;
    font-weight: 600;
  }

  .setting-description,
  .profile-full-name,
  .signed-out-message {
    color: #71717a;
    font-size: 0.875rem;
  }

  .setting-description {
    margin-bottom: 0.5rem;
  }

  .field-label {
    font-size: 0.875rem;
    font-weight: 500;
  }

  .location-input {
    border: 1px solid #d4d4d8;
    border-radius: 0.25rem;
    background: #fff;
    padding: 0.5rem 0.75rem;
    color: #18181b;
  }

  .save-button {
    align-self: flex-start;
    margin-top: 0.5rem;
    border-radius: 0.375rem;
    background: #059669;
    padding: 0.625rem 1rem;
    color: #fff;
    font-weight: 600;
  }

  .save-button:hover {
    background: #047857;
  }

  .form-message {
    font-size: 0.875rem;
  }

  .error-message {
    color: #b91c1c;
  }

  .success-message {
    color: #047857;
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

  :global(.dark) .setting-description,
  :global(.dark) .profile-full-name,
  :global(.dark) .signed-out-message {
    color: #a1a1aa;
  }

  :global(.dark) .location-input {
    border-color: #3f3f46;
    background: #27272a;
    color: #f4f4f5;
  }

  :global(.dark) .success-message {
    color: #6ee7b7;
  }
</style>
