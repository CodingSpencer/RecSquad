<div class="page-shell">
  <main class="page-content">
    <h1 class="page-title">
      Events
    </h1>
    <p class="page-description">
      Browse and join upcoming sports events. Event creation and RSVP logic
      goes here.
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
    align-items: center;
    justify-content: center;
    background: #fafafa;
  }

  .page-content {
    display: flex;
    width: 100%;
    max-width: 48rem;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    background: #fff;
    padding: 8rem 1.5rem;
    text-align: center;
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
    font-size: 1.125rem;
    line-height: 2rem;
    color: #52525b;
    text-align: center;
  }

  .page-actions {
    display: flex;
    flex-direction: column;
    align-items: center;
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
