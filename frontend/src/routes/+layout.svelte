<script lang="ts">
  import '../app.css'
  import Navbar from '$lib/components/Navbar.svelte'
  import type { PageData } from './$types'

  export let data: PageData
</script>

<nav class="site-nav">
  <Navbar user={data.user} profile={data.profile} />
</nav>

<div class="site-shell">
  <main class="site-content">
    <slot />
  </main>
</div>

<style>
  .site-nav {
    position: sticky;
    top: 0;
    z-index: 40;
    border-bottom: 1px solid #e4e4e7;
  }

  .site-shell {
    display: flex;
    min-height: 100vh;
    flex-direction: column;
  }

  .site-content {
    width: 100%;
    max-width: 56rem;
    flex: 1;
    margin: 0 auto;
    padding: 1rem;
  }

  :global(body) {
    margin: 0;
  }

  :global(.dark) .site-nav {
    border-color: #27272a;
  }

  @media (min-width: 640px) {
    .site-content {
      padding: 1.5rem;
    }
  }
</style>
