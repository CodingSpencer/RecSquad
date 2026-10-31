<script lang="ts">
  import { enhance } from '$app/forms'
  import type { ActionData, PageData } from './$types'

  export let data: PageData
  export let form: ActionData

  function formatEventTime(value: string) {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'UTC',
      timeZoneName: 'short'
    }).format(new Date(value))
  }

  function formatEndDate(value: string) {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    }).format(new Date(`${value}T00:00:00Z`))
  }
</script>

<main class="event-page">
  <a href="/events" class="back-link">← Back to Events</a>

  <article class="event-card">
    <header class="event-header">
      <div>
        <p class="eyebrow">Event details</p>
        <h1 class="event-title">{data.event.title}</h1>
      </div>
      <span
        class="event-type"
        class:badge-green={data.event.event_type === 'Pick Up'}
        class:badge-yellow={data.event.event_type === 'Practice'}
        class:badge-maroon={data.event.event_type === 'Game'}
      >{data.event.event_type}</span>
    </header>

    {#if data.group}
      <p class="group-line">
        Hosted by <a href={`/groups/${data.group.id}`}>{data.group.name}</a>
        {#if data.group.city && data.group.state}
          <span> · {data.group.city}, {data.group.state}</span>
        {/if}
      </p>
      {#if data.group.sport}
        <p class="group-sport">{data.group.sport}</p>
      {/if}
    {/if}

    <p class="event-time">
      <time datetime={data.event.start_time}>{formatEventTime(data.event.start_time)}</time>
    </p>

    <div class="event-labels">
      <span
        class="event-label"
        class:badge-green={data.event.skill_level === 'Beginner'}
        class:badge-yellow={data.event.skill_level === 'Intermediate'}
        class:badge-maroon={data.event.skill_level === 'Experienced'}
      >{data.event.skill_level}</span>
      <span
        class="event-label"
        class:badge-casual={data.event.event_style === 'Casual'}
        class:badge-orange={data.event.event_style === 'Competitive'}
        class:badge-dark-green={data.event.event_style === 'Tournament'}
      >{data.event.event_style}</span>
    </div>

    {#if data.event.is_recurring}
      <p class="event-detail">
        Repeats weekly: {data.event.recurrence_days.join(', ')}
        {#if data.event.recurrence_end_date}
          · Until {formatEndDate(data.event.recurrence_end_date)}
        {:else}
          · No end date
        {/if}
        <span class="series-note">· RSVP applies to the recurring series</span>
      </p>
    {/if}
    {#if data.event.venue_address}
      <p class="event-detail">{data.event.venue_address}</p>
    {/if}
    {#if data.event.city || data.event.state}
      <p class="event-detail">
        {[data.event.city, data.event.state].filter(Boolean).join(', ')}
      </p>
    {/if}

    <section class="rsvp-panel" aria-labelledby="rsvp-heading">
      <div>
        <h2 id="rsvp-heading" class="rsvp-heading">RSVP</h2>
        <p class="rsvp-count">
          {data.rsvpCount}
          {#if data.event.max_players}
            / {data.event.max_players}
          {/if}
          {data.rsvpCount === 1 ? 'player' : 'players'} attending
        </p>
      </div>

      <div class="rsvp-actions">
        {#if form?.error}
          <p class="error-message" role="alert">{form.error}</p>
        {/if}

        {#if data.isSignedIn}
          {#if data.hasRsvped}
            <form method="POST" action="?/cancel" use:enhance>
              <button type="submit" class="cancel-button">Cancel RSVP</button>
            </form>
          {:else if data.rsvpOpen}
            <form method="POST" action="?/rsvp" use:enhance>
              <button
                type="submit"
                class="primary-button"
                disabled={data.event.max_players !== null && data.rsvpCount >= data.event.max_players}
              >
                RSVP
              </button>
            </form>
          {:else}
            <p class="closed-message">This event is no longer accepting RSVPs.</p>
          {/if}
        {:else if data.rsvpOpen}
          <a href="/login" class="primary-button">Sign in to RSVP</a>
        {:else}
          <p class="closed-message">This event is no longer accepting RSVPs.</p>
        {/if}
      </div>
    </section>
  </article>
</main>

<style>
  .event-page {
    width: 100%;
    max-width: 48rem;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }

  .back-link {
    display: inline-block;
    margin-bottom: 1rem;
    color: #059669;
  }

  .back-link:hover,
  .group-line a:hover {
    text-decoration: underline;
  }

  .event-card {
    border: 1px solid #e4e4e7;
    border-radius: 0.75rem;
    background: #fff;
    padding: 1.5rem;
  }

  .event-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
  }

  .eyebrow {
    margin-bottom: 0.25rem;
    color: #71717a;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .event-title {
    color: #18181b;
    font-size: 1.875rem;
    font-weight: 700;
  }

  .event-type,
  .event-label {
    border-radius: 9999px;
    padding: 0.25rem 0.625rem;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .event-type {
    flex-shrink: 0;
    border: 1px solid currentColor;
    border-radius: 0.375rem;
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }

  .group-line {
    margin-top: 0.75rem;
    color: #52525b;
  }

  .group-line a {
    color: #059669;
    font-weight: 500;
  }

  .group-sport {
    margin-top: 0.25rem;
    color: #71717a;
  }

  .event-time {
    margin-top: 1.5rem;
    color: #27272a;
    font-size: 1.125rem;
    font-weight: 600;
  }

  .event-labels {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .event-label {
    background: #f4f4f5;
    color: #3f3f46;
  }

  .badge-green {
    background: #d1fae5;
    color: #065f46;
  }

  .badge-yellow {
    background: #fef3c7;
    color: #92400e;
  }

  .badge-orange {
    background: #c2410c;
    color: #fff;
  }

  .badge-casual {
    background: #15803d;
    color: #fff;
  }

  .badge-maroon {
    background: #f3e8eb;
    color: #6b1f32;
  }

  .badge-dark-green {
    background: #065f46;
    color: #ecfdf5;
  }

  .event-detail {
    margin-top: 0.75rem;
    color: #52525b;
  }

  .series-note {
    color: #71717a;
  }

  .rsvp-panel {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 2rem;
    border-top: 1px solid #e4e4e7;
    padding-top: 1.25rem;
  }

  .rsvp-heading {
    font-size: 1.125rem;
    font-weight: 600;
  }

  .rsvp-count,
  .closed-message {
    margin-top: 0.25rem;
    color: #71717a;
    font-size: 0.875rem;
  }

  .rsvp-actions {
    display: flex;
    width: 9rem;
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .rsvp-actions form {
    width: 100%;
  }

  .primary-button,
  .cancel-button {
    display: block;
    width: 100%;
    min-height: 2.75rem;
    border: 0;
    border-radius: 0.375rem;
    padding: 0.625rem 1rem;
    color: #fff;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 150ms ease, box-shadow 150ms ease, transform 150ms ease;
  }

  .primary-button {
    background: #059669;
    box-shadow: 0 2px 4px rgb(5 150 105 / 20%);
  }

  .primary-button:hover:not(:disabled) {
    transform: translateY(-1px);
    background: #047857;
    box-shadow: 0 4px 8px rgb(5 150 105 / 25%);
  }

  .primary-button:disabled {
    background: #a1a1aa;
    cursor: not-allowed;
  }

  .cancel-button {
    background: #7f1d1d;
    box-shadow: 0 2px 4px rgb(127 29 29 / 20%);
  }

  .cancel-button:hover {
    transform: translateY(-1px);
    background: #991b1b;
    box-shadow: 0 4px 8px rgb(127 29 29 / 25%);
  }

  .primary-button:active:not(:disabled),
  .cancel-button:active {
    transform: translateY(0);
  }

  .error-message {
    color: #b91c1c;
    font-size: 0.875rem;
  }

  :global(.dark) .event-card {
    border-color: #3f3f46;
    background: #000;
  }

  :global(.dark) .event-title,
  :global(.dark) .event-time {
    color: #fafafa;
  }

  :global(.dark) .eyebrow,
  :global(.dark) .group-sport,
  :global(.dark) .event-detail,
  :global(.dark) .rsvp-count,
  :global(.dark) .closed-message {
    color: #a1a1aa;
  }

  :global(.dark) .group-line {
    color: #d4d4d8;
  }

  :global(.dark) .group-line a,
  :global(.dark) .back-link {
    color: #34d399;
  }

  :global(.dark) .rsvp-panel {
    border-color: #3f3f46;
  }

  :global(.dark) .badge-green {
    background: #064e3b;
    color: #a7f3d0;
  }

  :global(.dark) .badge-yellow {
    background: #713f12;
    color: #fde68a;
  }

  :global(.dark) .badge-orange {
    background: #7c2d12;
    color: #fed7aa;
  }

  :global(.dark) .badge-casual {
    background: #064e3b;
    color: #fff;
  }

  :global(.dark) .badge-maroon {
    background: #4c1d2b;
    color: #f3d9e0;
  }

  :global(.dark) .badge-dark-green {
    background: #064e3b;
    color: #a7f3d0;
  }

  :global(.dark) .event-label:not(.badge-green):not(.badge-yellow):not(.badge-orange):not(.badge-casual):not(.badge-maroon):not(.badge-dark-green) {
    background: #27272a;
    color: #d4d4d8;
  }

  @media (max-width: 480px) {
    .event-header,
    .rsvp-panel {
      align-items: flex-start;
      flex-direction: column;
    }

    .rsvp-actions {
      width: 100%;
      max-width: 16rem;
    }
  }
</style>
