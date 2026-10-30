<script lang="ts">
  import { onMount } from 'svelte'

  let theme = 'system'

  onMount(() => {
    const saved = localStorage.getItem('theme')
    if (saved) theme = saved
    applyTheme(theme)
  })

  function applyTheme(value: string) {
    const root = document.documentElement
    if (value === 'dark' || (value === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    if (value !== 'system') localStorage.setItem('theme', value)
    else localStorage.removeItem('theme')
  }
</script>

<main class="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
  <h1 class="text-2xl font-bold">Settings</h1>
  <div class="flex flex-col gap-2 w-full max-w-sm">
    <label class="text-sm font-medium">Theme</label>
    <select bind:value={theme} onchange={(e) => applyTheme(e.target.value)} class="border rounded px-3 py-2">
      <option value="system">System</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </div>
</main>
