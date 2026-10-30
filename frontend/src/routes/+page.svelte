<script lang="ts">
  import SignInButton from '$lib/components/SignInButton.svelte'
</script>

<div class="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-black min-h-[calc(100vh-4rem)]">
  <main class="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-16 px-6 bg-white dark:bg-black sm:items-start sm:text-left">
    <div class="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
      <h1 class="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
        Find your game. Join your squad.
      </h1>
      <p class="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
        RecSquad connects players with local sports groups and events. Create a
        profile, browse upcoming games, and RSVP in seconds.
      </p>
    </div>
    <div class="flex flex-col gap-4 text-base font-medium sm:flex-row w-full">
      <a
        href="/events"
        class="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 text-white transition-colors hover:bg-emerald-700 dark:hover:bg-emerald-600 md:w-[158px]"
      >
        Browse Events
      </a>
      <SignInButton />
    </div>

    <section class="mt-20 flex flex-col items-center justify-between gap-12 py-16 px-6 border-t border-zinc-200 dark:border-zinc-800 sm:flex-row">
      <div class="flex flex-col items-center gap-4 text-center sm:text-left">
        <h2 class="text-xl font-semibold text-black dark:text-zinc-50">Browse Events</h2>
        <p class="text-zinc-600 dark:text-zinc-400 text-sm">See upcoming games and RSVP with one click.</p>
      </div>
      <div class="flex flex-col items-center gap-4 text-center sm:text-left">
        <h2 class="text-xl font-semibold text-black dark:text-zinc-50">Player Profile</h2>
        <p class="text-zinc-600 dark:text-zinc-400 text-sm">Track your sports and skill level.</p>
      </div>
      <div class="flex flex-col items-center gap-4 text-center sm:text-left">
        <h2 class="text-xl font-semibold text-black dark:text-zinc-50">Group Discovery</h2>
        <p class="text-zinc-600 dark:text-zinc-400 text-sm">Find local groups for your favorite sports.</p>
      </div>
    </section>
  </main>
</div>
