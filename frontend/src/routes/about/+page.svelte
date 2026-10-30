<script lang="ts">
  import { page } from '$app/stores'
</script>

<div class="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-black min-h-[calc(100vh-4rem)]">
  <main class="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-6 bg-white dark:bg-black sm:items-start sm:text-left">
    <h1 class="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
      About
    </h1>
    <p class="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400 text-center">
      RecSquad connects players with local sports groups and events. Built for
      Bakeoff_2 with SvelteKit and Supabase.
    </p>
    <div class="mt-12 flex flex-col items-center gap-4 sm:flex-row">
      <a
        href="/"
        class="px-4 py-2 rounded-md text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        ← Back to Home
      </a>
    </div>
  </main>
</div>
