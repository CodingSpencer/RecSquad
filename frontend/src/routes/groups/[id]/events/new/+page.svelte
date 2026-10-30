<script lang="ts">
  import { enhance } from '$app/forms'
  import type { PageData } from './$types'

  export let data: PageData
</script>

<main class="max-w-md mx-auto p-6">
  <h1 class="text-2xl font-bold mb-4">Create Event</h1>
  {#if data.error}
    <p class="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-800">{data.error}</p>
  {/if}
  <form method="POST" use:enhance class="space-y-3">
    <div>
      <label for="event-title" class="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">Title</label>
      <input id="event-title" name="title" placeholder="Title" required class="border w-full p-2 rounded text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800" />
    </div>
    <div>
      <label for="event-date" class="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">Date & time</label>
      <input id="event-date" type="datetime-local" name="date" required class="border w-full p-2 rounded text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800" />
    </div>
    <button class="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition font-medium">Create</button>
  </form>
  <p class="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
    <a href=".." class="text-emerald-600 dark:text-emerald-400 hover:underline">← Back to Group</a>
  </p>
</main>
