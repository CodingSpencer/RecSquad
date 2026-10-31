<script lang="ts">
  import type { PageData } from './$types'

  export let data: PageData

  function formatEventTime(value: string) {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
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
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'
    }).format(new Date(`${value}T00:00:00Z`))
  }
</script>

<div class="page-shell">
  <main class="page-content">
    <header class="page-header">
      <div>
        <h1 class="page-title">Events</h1>
      </div>
    </header>

    {#if data.events.length === 0}
      <p class="empty-message">
        No upcoming events yet. Visit a group page to see its schedule or create an event.
      </p>
    {:else}
      <ul class="event-list">
        {#each data.events as event (event.id)}
          <li class="event-card">
            <div class="event-heading">
              <div>
                <h2 class="event-title">
                  <a href={`/events/${event.id}`} class="event-title-link">{event.title}</a>
                </h2>
                {#if event.group}
                  <a href={`/groups/${event.group.id}`} class="group-link">
                    {event.group.name}
                    {#if event.group.city && event.group.state}
                      <span class="group-location">· {event.group.city}, {event.group.state}</span>
                    {/if}
                  </a>
                  {#if event.group.sport}
                    <p class="group-sport">{event.group.sport}</p>
                  {/if}
                {:else}
                  <p class="group-sport">Group details unavailable</p>
                {/if}
              </div>
              <span
                class="event-type"
                class:badge-green={event.event_type === 'Pick Up'}
                class:badge-yellow={event.event_type === 'Practice'}
                class:badge-maroon={event.event_type === 'Game'}
              >{event.event_type}</span>
            </div>

            <p class="event-time">
              <time datetime={event.start_time}>{formatEventTime(event.start_time)}</time>
            </p>

            <div class="event-labels">
              <span
                class="event-label"
                class:badge-green={event.skill_level === 'Beginner'}
                class:badge-yellow={event.skill_level === 'Intermediate'}
                class:badge-maroon={event.skill_level === 'Experienced'}
              >{event.skill_level}</span>
            </div>

            {#if event.is_recurring}
              <p class="event-detail">
                Repeats weekly: {event.recurrence_days.join(', ')}
                {#if event.recurrence_end_date}
                  · Until {formatEndDate(event.recurrence_end_date)}
                {:else}
                  · No end date
                {/if}
              </p>
            {/if}
            {#if event.venue_address}
              <p class="event-detail">{event.venue_address}</p>
            {/if}
            {#if event.city || event.state}
              <p class="event-detail">{[event.city, event.state].filter(Boolean).join(', ')}</p>
            {/if}
            {#if event.max_players}
              <p class="event-detail">Capacity: {event.max_players} players</p>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  </main>
</div>

<style>
  .page-shell {
    display: flex;
    min-height: calc(100vh - 8rem);
    flex: 1;
    flex-direction: column;
    align-items: center;
    background: #fafafa;
  }

  .page-content {
    display: flex;
    width: 100%;
    max-width: 56rem;
    flex: 1;
    flex-direction: column;
    gap: 2rem;
    background: #fff;
    padding: 2rem 1.5rem;
  }

  .page-header,
  .event-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
  }

  .page-header {
    align-items: center;
  }

  .page-title {
    font-size: 1.875rem;
    font-weight: 700;
    color: #18181b;
  }

  .empty-message {
    border: 1px solid #e4e4e7;
    border-radius: 0.5rem;
    padding: 1.5rem;
    color: #52525b;
  }

  .event-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .event-card {
    position: relative;
    border: 1px solid #e4e4e7;
    border-radius: 0.5rem;
    padding: 1.25rem;
    transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease;
  }

  .event-card:hover {
    transform: translateY(-2px);
    border-color: #a1a1aa;
    box-shadow: 0 10px 24px rgb(24 24 27 / 20%);
  }

  .event-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #18181b;
  }

  .event-title-link::after {
    position: absolute;
    inset: 0;
    content: '';
  }

  .event-title-link:focus-visible::after {
    border-radius: 0.5rem;
    outline: 2px solid #059669;
    outline-offset: 3px;
  }

  .group-link {
    position: relative;
    z-index: 1;
    display: inline-block;
    margin-top: 0.25rem;
    color: #059669;
  }

  .group-link:hover {
    text-decoration: underline;
  }

  .group-location {
    color: #71717a;
    font-weight: 400;
  }

  .group-sport {
    margin-top: 0.25rem;
    font-size: 0.875rem;
    color: #71717a;
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
    border: 1px solid transparent;
    border-radius: 0.375rem;
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }

  .event-labels {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }

  .event-label {
    background: #f4f4f5;
    color: #3f3f46;
  }

  .badge-green {
    border-color: #15803d;
    background: #15803d;
    color: #fff;
  }

  .badge-yellow {
    border-color: #a16207;
    background: #a16207;
    color: #fff;
  }

  .badge-maroon {
    border-color: #6b1f32;
    background: #6b1f32;
    color: #fff;
  }

  .event-time {
    margin-top: 1rem;
    font-weight: 500;
    color: #27272a;
  }

  .event-detail {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: #52525b;
  }

  :global(.dark) .page-shell,
  :global(.dark) .page-content {
    background: #000;
  }

  :global(.dark) .page-title,
  :global(.dark) .event-title,
  :global(.dark) .event-time {
    color: #fafafa;
  }

  :global(.dark) .empty-message,
  :global(.dark) .group-sport,
  :global(.dark) .group-location,
  :global(.dark) .event-detail {
    color: #a1a1aa;
  }

  :global(.dark) .empty-message,
  :global(.dark) .event-card {
    border-color: #3f3f46;
  }

  :global(.dark) .event-card:hover {
    border-color: #71717a;
    box-shadow: 0 10px 24px rgb(255 255 255 / 14%);
  }

  :global(.dark) .group-link {
    color: #34d399;
  }

  :global(.dark) .badge-green {
    border-color: #166534;
    background: #166534;
    color: #fff;
  }

  :global(.dark) .badge-yellow {
    border-color: #854d0e;
    background: #854d0e;
    color: #fff;
  }

  :global(.dark) .badge-maroon {
    border-color: #6b1f32;
    background: #6b1f32;
    color: #fff;
  }

  :global(.dark) .event-label:not(.badge-green):not(.badge-yellow):not(.badge-maroon) {
    background: #27272a;
    color: #d4d4d8;
  }

  @media (prefers-reduced-motion: reduce) {
    .event-card {
      transition: none;
    }

    .event-card:hover {
      transform: none;
    }
  }

  @media (max-width: 480px) {
    .page-header {
      align-items: flex-start;
      flex-direction: column;
    }

    .event-heading {
      flex-direction: column;
    }
  }
</style>
