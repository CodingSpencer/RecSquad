<script lang="ts">
  import type { PageData } from './$types'

  export let data: PageData & { groups: any[] }
</script>

<main class="max-w-3xl mx-auto p-6">
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-2xl font-bold">Groups</h1>
    <a
      href="/groups/new"
      class="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition font-medium"
    >
      Create Group
    </a>
  </div>
  {#if data.groups.length === 0}
    <p class="text-zinc-500">No groups yet. Create one to get started.</p>
  {:else}
    <ul class="space-y-3">
      {#each data.groups as g (g.id)}
        <li class="border rounded p-4">
          <a href={`/groups/${g.id}`} class="font-semibold text-emerald-600 dark:text-emerald-400">{g.name}</a>
          <p class="text-sm text-zinc-500 dark:text-zinc-400">{g.sport} · {g.description}</p>
        </li>
      {/each}
    </ul>
  {/if}
</main>
