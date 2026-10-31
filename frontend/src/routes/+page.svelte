<script lang="ts">
  import SignInButton from '$lib/components/SignInButton.svelte'
  import type { PageData } from './$types'

  export let data: PageData
</script>

<div class="home-shell">
  <main class="home-content">
    <div class="home-intro">
      <h1 class="home-title">
        Find your sport and join a team!
      </h1>
      <p class="home-description">
        RecSquad connects players with local sports groups and events. Create a
        profile, browse upcoming games, and RSVP in moments.
      </p>
    </div>
    <div class="home-actions">
      <SignInButton user={data.user} />
    </div>

    <section class="features">
      <div class="feature">
        <h2 class="feature-title">Feed</h2>
        <p class="feature-description">Discover local, sport, and popular event posts.</p>
        <a href="/feed" class="browse-link">Browse Feed</a>
      </div>
      <div class="feature">
        <h2 class="feature-title">Events</h2>
        <p class="feature-description">See upcoming games and RSVP with one click.</p>
        <a href="/events" class="browse-link">Browse Events</a>
      </div>
      <div class="feature">
        <h2 class="feature-title">Groups</h2>
        <p class="feature-description">Find local groups for your favorite sports.</p>
        <a href="/groups" class="browse-link">Browse Groups</a>
      </div>
      <div class="feature">
        <h2 class="feature-title">Profile</h2>
        <p class="feature-description">Manage your profile and account location.</p>
        <a href="/profile" class="browse-link">Browse Profile</a>
      </div>
    </section>
  </main>
</div>

<style>
  .home-shell {
    display: flex;
    flex: 1;
    min-height: calc(100vh - 4rem);
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #fafafa;
  }

  .home-content {
    display: flex;
    width: 100%;
    max-width: 48rem;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    background: #fff;
    padding: 4rem 1.5rem;
  }

  .home-intro {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    text-align: center;
  }

  .home-title {
    max-width: 20rem;
    font-size: 1.875rem;
    font-weight: 600;
    line-height: 2.5rem;
    letter-spacing: -0.025em;
    color: #000;
  }

  .home-description {
    max-width: 28rem;
    font-size: 1.125rem;
    line-height: 2rem;
    color: #52525b;
  }

  .home-actions {
    display: flex;
    width: 100%;
    flex-direction: column;
    gap: 1rem;
    font-size: 1rem;
    font-weight: 500;
  }

  .browse-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.375rem;
    background: #059669;
    padding: 0.5rem 0.875rem;
    color: #fff;
    font-size: 0.875rem;
    font-weight: 500;
    transition: background-color 150ms;
  }

  .browse-link:hover {
    background: #047857;
  }

  .features {
    display: flex;
    width: 100%;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    margin-top: 5rem;
    border-top: 1px solid #e4e4e7;
    padding: 4rem 1.5rem;
  }

  .feature {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    text-align: center;
  }

  .feature-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #000;
  }

  .feature-description {
    font-size: 0.875rem;
    color: #52525b;
  }

  :global(.dark) .home-shell,
  :global(.dark) .home-content {
    background: #000;
  }

  :global(.dark) .home-title,
  :global(.dark) .feature-title {
    color: #fafafa;
  }

  :global(.dark) .home-description,
  :global(.dark) .feature-description {
    color: #a1a1aa;
  }

  :global(.dark) .features {
    border-color: #27272a;
  }

  @media (min-width: 640px) {
    .home-content {
      align-items: flex-start;
      text-align: left;
    }

    .home-intro {
      align-items: flex-start;
      text-align: left;
    }

    .home-actions,
    .features {
      flex-direction: row;
    }

    .feature {
      align-items: flex-start;
      text-align: left;
    }
  }

  @media (min-width: 768px) {
    .feature {
      flex: 1;
    }
  }
</style>
