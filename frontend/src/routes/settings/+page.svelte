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

<main class="settings-page">
  <h1 class="page-title">Settings</h1>
  <div class="theme-setting">
    <label for="theme-select" class="field-label">Theme</label>
    <select id="theme-select" bind:value={theme} onchange={(e) => applyTheme(e.target.value)} class="theme-select">
      <option value="system">System</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </div>
</main>

<style>
  .settings-page {
    display: flex;
    width: 100%;
    max-width: 56rem;
    min-height: calc(100vh - 8rem);
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }

  .page-title {
    font-size: 1.5rem;
    font-weight: 700;
  }

  .theme-setting {
    display: flex;
    width: 100%;
    max-width: 24rem;
    flex-direction: column;
    gap: 0.5rem;
  }

  .field-label {
    font-size: 0.875rem;
    font-weight: 500;
  }

  .theme-select {
    border: 1px solid #d4d4d8;
    border-radius: 0.25rem;
    background: #fff;
    padding: 0.5rem 0.75rem;
    color: #18181b;
  }

  .theme-select {
    border: 1px solid #d4d4d8;
    border-radius: 0.25rem;
    background: #fff;
    padding: 0.5rem 0.75rem;
    color: #18181b;
  }

  :global(.dark) .theme-select {
    border-color: #3f3f46;
    background: #27272a;
    color: #f4f4f5;
  }

</style>
