<script lang="ts">
  import type { PageData } from './$types'

  export let data: PageData & { groups: any[] }
</script>

<main class="groups-page">
  <div class="groups-heading">
    <h1 class="page-title">Groups</h1>
    <a
      href="/groups/new"
      class="primary-link"
    >
      Create Group
    </a>
  </div>
  {#if data.groups.length === 0}
    <p class="empty-message">No groups yet. Create one to get started.</p>
  {:else}
    <ul class="group-list">
      {#each data.groups as g (g.id)}
        <li class="group-item">
          <a href={`/groups/${g.id}`} class="group-link">
            {#if g.image_url}
              <img src={g.image_url} alt="" class="group-avatar" />
            {:else}
              <span class="group-avatar group-initial" aria-hidden="true">
                {g.name.trim().charAt(0).toUpperCase()}
              </span>
            {/if}
            <span class="group-info">
              <span class="group-name">
                {g.name}
                {#if g.city && g.state}
                  <span class="group-location">· {g.city}, {g.state}</span>
                {/if}
              </span>
              <span class="group-description">{[g.sport, g.description].filter(Boolean).join(' · ')}</span>
            </span>
          </a>
        </li>
      {/each}
    </ul>
  {/if}
</main>

<style>
  .groups-page {
    max-width: 48rem;
    margin: 0 auto;
    padding: 1.5rem;
  }

  .groups-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
  }

  .page-title {
    font-size: 1.5rem;
    font-weight: 700;
  }

  .primary-link {
    border-radius: 0.25rem;
    background: #059669;
    padding: 0.5rem 1rem;
    color: #fff;
    font-weight: 500;
    transition: background-color 150ms;
  }

  .primary-link:hover {
    background: #047857;
  }

  .empty-message {
    color: #71717a;
  }

  .group-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .group-item {
    border-bottom: 1px solid #e4e4e7;
    padding: 0.875rem 0;
  }

  .group-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .group-avatar {
    width: 2.75rem;
    height: 2.75rem;
    flex-shrink: 0;
    border-radius: 9999px;
    background: #d1fae5;
    object-fit: cover;
  }

  .group-initial {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #047857;
    font-weight: 700;
  }

  .group-info {
    display: flex;
    min-width: 0;
    flex-direction: column;
  }

  .group-name {
    font-weight: 600;
    color: #059669;
  }

  .group-location {
    font-weight: 400;
    color: #71717a;
  }

  .group-description {
    font-size: 0.875rem;
    color: #71717a;
  }

  :global(.dark) .group-item {
    border-color: #27272a;
  }

  :global(.dark) .group-name {
    color: #34d399;
  }

  :global(.dark) .group-location {
    color: #a1a1aa;
  }

  :global(.dark) .group-description {
    color: #a1a1aa;
  }

  :global(.dark) .group-initial {
    background: #064e3b;
    color: #a7f3d0;
  }
</style>
