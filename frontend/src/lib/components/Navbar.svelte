<script lang="ts">
  type User = NonNullable<App.PageData['user']>

  type Profile = {
    username: string | null
    full_name: string | null
    avatar_url: string | null
  }

  export let user: User | null = null
  export let profile: Profile | null = null

  let loggedIn = false
  let showDropdown = false
  let initial = 'P'

  $: loggedIn = Boolean(user)
  $: name = profile?.username || profile?.full_name || user?.email || 'Profile'
  $: avatarUrl = profile?.avatar_url ?? null
  $: initial = name.trim().charAt(0).toUpperCase() || '?'
</script>

<nav class="w-full flex items-center justify-between px-4 py-4 border-b bg-white dark:bg-black">
  <a href="/" class="font-bold text-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-500">RecSquad</a>

  <div class="flex items-center gap-4">
    <a href="/" class="text-sm font-medium text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400">Home</a>
    <a href="/feed" class="text-sm font-medium text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400">Feed</a>
    <a href="/events" class="text-sm font-medium text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400">Events</a>
    <a href="/groups" class="text-sm font-medium text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400">Groups</a>
  </div>

  <div class="flex items-center gap-3">
    {#if loggedIn}
      <div class="relative">
        <button
          type="button"
          onclick={() => (showDropdown = !showDropdown)}
          aria-expanded={showDropdown}
          aria-haspopup="true"
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          <span class="text-sm font-medium text-zinc-700 dark:text-zinc-200">{name}</span>
          {#if avatarUrl}
            <img src={avatarUrl} alt="Profile" class="h-9 w-9 rounded-full object-cover" />
          {:else}
            <div class="h-9 w-9 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-medium">{initial}</div>
          {/if}
        </button>
        {#if showDropdown}
          <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded shadow-lg z-10">
            <a href="/profile" class="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800">Profile</a>
            <a href="/settings" class="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800">Settings</a>
            <form method="POST" action="/?/logout">
              <button type="submit" class="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800">Log Out</button>
            </form>
          </div>
        {/if}
      </div>
    {:else}
      <a href="/login" class="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">Sign In</a>
    {/if}
  </div>
</nav>

<style>
  nav a {
    transition: color 0.2s;
  }
</style>
