<script lang="ts">
  import type { PageData } from './$types'

  export let data: PageData & { group: any; isAdmin: boolean; user: any }
</script>

<main class="group-page">
  {#if !data.group}
    <p class="loading-message">Loading group...</p>
  {:else}
    <h1 class="page-title">{data.group.name}</h1>
    <p class="group-description">{data.group.sport} · {data.group.description}</p>
    {#if data.isAdmin}
      <a
        href={`/groups/${data.group.id}/events/new`}
        class="primary-link"
      >
        Create Event
      </a>
    {/if}
  {/if}
</main>

<style>
  .group-page {
    max-width: 48rem;
    margin: 0 auto;
    padding: 1.5rem;
  }

  .loading-message {
    color: #71717a;
  }

  .page-title {
    font-size: 1.5rem;
    font-weight: 700;
  }

  .group-description {
    color: #71717a;
  }

  .primary-link {
    display: inline-block;
    margin-top: 1rem;
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

  :global(.dark) .group-description {
    color: #a1a1aa;
  }
</style>
