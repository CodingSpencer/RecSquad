<script lang="ts">
  import '../app.css'
  import Navbar from '$lib/components/Navbar.svelte'
  import type { PageData } from './$types'

  export let data: PageData
</script>

<nav class="sticky top-0 z-40 border-b">
  <Navbar session={data.session} />
</nav>

<div class="flex min-h-screen flex-col">
  <main class="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6">
    <slot />
  </main>
</div>

<style>
  :global(body) {
    margin: 0;
  }
</style>
