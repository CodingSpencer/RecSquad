<script lang="ts">
  import type { PageData } from './$types'

  export let data: PageData & { group: any; isAdmin: boolean; user: any }
</script>

<main class="max-w-3xl mx-auto p-6">
  {#if !data.group}
    <p class="text-zinc-500">Loading group...</p>
  {:else}
    <h1 class="text-2xl font-bold">{data.group.name}</h1>
    <p class="text-zinc-500 dark:text-zinc-400">{data.group.sport} · {data.group.description}</p>
    {#if data.isAdmin}
      <a
        href={`/groups/${data.group.id}/events/new`}
        class="inline-block mt-4 bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition font-medium"
      >
        Create Event
      </a>
    {/if}
  {/if}
</main>
