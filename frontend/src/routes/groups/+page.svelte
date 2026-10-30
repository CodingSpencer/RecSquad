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
          <a href={`/groups/${g.id}`} class="group-name">{g.name}</a>
          <p class="group-description">{g.sport} · {g.description}</p>
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
    border: 1px solid #e4e4e7;
    border-radius: 0.25rem;
    padding: 1rem;
  }

  .group-name {
    font-weight: 600;
    color: #059669;
  }

  .group-description {
    font-size: 0.875rem;
    color: #71717a;
  }

  :global(.dark) .group-item {
    border-color: #3f3f46;
  }

  :global(.dark) .group-name {
    color: #34d399;
  }

  :global(.dark) .group-description {
    color: #a1a1aa;
  }
</style>
