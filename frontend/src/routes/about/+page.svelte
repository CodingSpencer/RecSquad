<script lang="ts">
  import { page } from '$app/stores'
</script>

<div class="page-shell">
  <main class="page-content">
    <h1 class="page-title">
      About
    </h1>
    <p class="page-description">
      RecSquad connects players with local sports groups and events. Built for
      Bakeoff_2 with SvelteKit and Supabase.
    </p>
    <div class="page-actions">
      <a
        href="/"
        class="back-link"
      >
        ← Back to Home
      </a>
    </div>
  </main>
</div>

<style>
  .page-shell {
    display: flex;
    min-height: calc(100vh - 4rem);
    flex: 1;
    flex-direction: column;
    align-items: flex-start;
    background: #fafafa;
  }

  .page-content {
    display: flex;
    width: 100%;
    max-width: 56rem;
    flex: 1;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    background: #fff;
    margin: 0 auto;
    padding: 2rem 1.5rem;
    text-align: left;
  }

  .page-title {
    max-width: 20rem;
    font-size: 1.875rem;
    font-weight: 600;
    line-height: 2.5rem;
    letter-spacing: -0.025em;
    color: #000;
    text-align: left;
  }

  .page-description {
    max-width: 28rem;
    margin-top: 1rem;
    font-size: 1.125rem;
    line-height: 2rem;
    color: #52525b;
    text-align: left;
  }

  .page-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    margin-top: 3rem;
  }

  .back-link {
    border-radius: 0.375rem;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #52525b;
  }

  .back-link:hover {
    color: #18181b;
  }

  :global(.dark) .page-shell,
  :global(.dark) .page-content {
    background: #000;
  }

  :global(.dark) .page-title {
    color: #fafafa;
  }

  :global(.dark) .page-description {
    color: #a1a1aa;
  }

  :global(.dark) .back-link {
    color: #a1a1aa;
  }

  :global(.dark) .back-link:hover {
    color: #fafafa;
  }

  @media (min-width: 640px) {
    .page-content {
      align-items: flex-start;
      text-align: left;
    }

    .page-actions {
      flex-direction: row;
    }
  }
</style>
