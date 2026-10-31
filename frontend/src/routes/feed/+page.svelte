<script lang="ts">
  import { getUsState } from '$lib/data/us-states'
  import type { PageData } from './$types'

  type FeedType = 'local' | 'sport' | 'popular'

  export let data: PageData

  let activeFeed: FeedType = 'local'
  let selectedSport = ''
  $: city = data.location?.city?.trim() ?? ''
  $: state = data.location?.state?.trim() ?? ''

  $: sports = [...new Set(data.events
    .map((event) => event.group?.sport?.trim())
    .filter((sport): sport is string => Boolean(sport)))].sort((a, b) => a.localeCompare(b))

  $: filteredEvents = data.events.filter((event) => {
    if (activeFeed === 'local') {
      if (!city || !state) return false
      const stateAbbreviation = getUsState(state)?.abbreviation
      if (!stateAbbreviation) return false
      const eventCity = event.city || event.group?.city || ''
      const eventState = event.state || event.group?.state || ''
      return eventCity.trim().toLowerCase() === city.toLowerCase()
        && getUsState(eventState)?.abbreviation === stateAbbreviation
    }

    if (activeFeed === 'sport') {
      const eventSport = event.group?.sport?.trim() || ''
      return Boolean(eventSport)
        && (!selectedSport || eventSport.toLowerCase() === selectedSport.toLowerCase())
    }

    return true
  })
  $: feedEvents = activeFeed === 'popular'
    ? [...filteredEvents].sort((a, b) =>
        b.rsvpCount - a.rsvpCount ||
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      )
    : filteredEvents

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
</script>

<main class="feed-layout">
  <nav class="feed-menu" aria-label="Choose event feed">
    <button
      type="button"
      class:active={activeFeed === 'local'}
      aria-pressed={activeFeed === 'local'}
      onclick={() => (activeFeed = 'local')}
    >Local</button>
    <button
      type="button"
      class:active={activeFeed === 'sport'}
      aria-pressed={activeFeed === 'sport'}
      onclick={() => (activeFeed = 'sport')}
    >Sport</button>
    <button
      type="button"
      class:active={activeFeed === 'popular'}
      aria-pressed={activeFeed === 'popular'}
      onclick={() => (activeFeed = 'popular')}
    >Popular</button>
  </nav>

  <section class="feed-page" aria-label={`${activeFeed} event feed`}>
    {#if activeFeed === 'local'}
      {#if city && state}
        <p class="feed-location">{city}, {state}</p>
      {:else}
        <p class="empty-message">
          Set your city and state in <a href={data.isSignedIn ? '/profile' : '/login'}>
            {data.isSignedIn ? 'your profile' : 'your account'}
          </a> to see local events.
        </p>
      {/if}
    {:else if activeFeed === 'sport'}
      <section class="filter-panel sport-filter" aria-label="Sport event filters">
        <select id="sport-filter" bind:value={selectedSport}>
          <option value="">All sports</option>
          {#each sports as sport (sport)}
            <option value={sport}>{sport}</option>
          {/each}
        </select>
      </section>
    {/if}

    {#if activeFeed === 'local' && (!city || !state)}
      <!-- The location prompt above replaces the event list until account location is set. -->
    {:else if feedEvents.length === 0}
      <p class="empty-message">
        {activeFeed === 'sport' && sports.length === 0
          ? 'No sports have events yet.'
          : 'No events match this feed yet. Try another feed or check back later.'}
      </p>
    {:else}
      <ul class="event-list">
        {#each feedEvents as event (event.id)}
        <li class="event-card">
          <div class="post-header">
            {#if event.group?.image_url}
              <img src={event.group.image_url} alt="" class="group-avatar" />
            {:else}
              <span class="group-avatar group-initial" aria-hidden="true">
                {event.group?.name.trim().charAt(0).toUpperCase() || 'R'}
              </span>
            {/if}
            <div class="post-byline">
              {#if event.group}
                <a href={`/groups/${event.group.id}`} class="group-link">{event.group.name}</a>
                <p class="post-context">
                  {#if event.group.sport}{event.group.sport}{/if}
                  {#if event.group.city || event.group.state}
                    {#if event.group.sport} · {/if}
                    {[event.group.city, event.group.state].filter(Boolean).join(', ')}
                  {/if}
                </p>
              {:else}
                <span class="group-link">RecSquad group</span>
                <p class="post-context">Group details unavailable</p>
              {/if}
            </div>
          </div>

          <div class="post-content">
            <h2 class="event-title">
              <a href={`/events/${event.id}`} class="event-title-link">{event.title}</a>
            </h2>
            <p class="event-time">
              <time datetime={event.start_time}>{formatEventTime(event.start_time)}</time>
              {#if event.city || event.state}
                <span> · {[event.city, event.state].filter(Boolean).join(', ')}</span>
              {/if}
            </p>
            <div class="event-labels">
              <span
                class="event-label"
                class:badge-green={event.event_type === 'Pick Up'}
                class:badge-yellow={event.event_type === 'Practice'}
                class:badge-maroon={event.event_type === 'Game'}
              >{event.event_type}</span>
              <span
                class="event-label"
                class:badge-green={event.skill_level === 'Beginner'}
                class:badge-yellow={event.skill_level === 'Intermediate'}
                class:badge-maroon={event.skill_level === 'Experienced'}
              >{event.skill_level}</span>
              {#if activeFeed === 'popular'}
                <span class="event-label badge-popular">{event.rsvpCount} RSVPs</span>
              {/if}
              {#if event.is_recurring}
                <span class="event-label">Weekly · {event.recurrence_days.join(', ')}</span>
              {/if}
            </div>
          </div>
        </li>
      {/each}
      </ul>
    {/if}
  </section>
</main>

<style>
  .feed-layout {
    display: grid;
    width: 100%;
    max-width: 64rem;
    min-height: calc(100vh - 8rem);
    grid-template-columns: 10rem minmax(0, 44rem);
    justify-content: center;
    gap: 1.5rem;
    margin: 0 auto;
    padding: 1.5rem 1.25rem;
  }

  .feed-menu {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding-top: 0.5rem;
  }

  .feed-menu button {
    border-radius: 0.375rem;
    padding: 0.625rem 0.75rem;
    text-align: left;
    color: #52525b;
    font-size: 0.9375rem;
    font-weight: 500;
    transition: background-color 150ms ease, color 150ms ease;
  }

  .feed-menu button:hover,
  .feed-menu button.active {
    background: #f4f4f5;
    color: #047857;
  }

  .feed-menu button.active {
    font-weight: 600;
  }

  .feed-page {
    width: 100%;
    min-width: 0;
    padding: 0 1.25rem;
    background: #fff;
  }

  .feed-location {
    margin-top: 0.25rem;
    color: #71717a;
    font-size: 0.875rem;
  }

  .group-link {
    color: #059669;
  }

  .filter-panel {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin: 0.75rem 0;
  }

  .filter-panel select {
    min-height: 2.5rem;
    border: 1px solid #e4e4e7;
    border-radius: 0.375rem;
    background: #fff;
    padding: 0.5rem 0.75rem;
    color: #18181b;
  }

  .sport-filter {
    align-items: center;
  }

  .sport-filter select {
    min-width: 12rem;
  }

  .feed-location {
    margin: 0.75rem 0;
  }

  .empty-message {
    margin-top: 1rem;
    padding: 1rem 0;
    color: #71717a;
    font-size: 0.9rem;
  }

  .event-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 0.25rem;
  }

  .event-card {
    position: relative;
    border: 1px solid #e7eaf0;
    border-radius: 0.5rem;
    background: #fff;
    padding: 1.25rem;
    box-shadow: 0 1px 3px rgb(30 41 59 / 5%);
    transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease;
  }

  .event-card:hover {
    transform: translateY(-2px);
    border-color: #cbd5e1;
    box-shadow: 0 8px 20px rgb(30 41 59 / 10%);
  }

  .event-title {
    color: #18181b;
    font-size: 1.125rem;
    font-weight: 650;
  }

  .event-title-link::after {
    position: absolute;
    inset: 0;
    content: '';
  }

  .event-title-link:focus-visible::after {
    border-radius: 0.25rem;
    outline: 2px solid #059669;
    outline-offset: 3px;
  }

  .post-header {
    display: flex;
    align-items: center;
    gap: 0.625rem;
  }

  .group-avatar {
    width: 2.25rem;
    height: 2.25rem;
    flex-shrink: 0;
    border-radius: 9999px;
    background: #d1fae5;
    object-fit: cover;
  }

  .group-initial {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #047857;
    font-size: 0.875rem;
    font-weight: 700;
  }

  .post-byline {
    min-width: 0;
    flex: 1;
  }

  .group-link {
    position: relative;
    z-index: 1;
    font-size: 0.875rem;
    font-weight: 600;
    line-height: 1.25rem;
  }

  .group-link:hover {
    text-decoration: underline;
  }

  .post-context {
    color: #71717a;
    font-size: 0.75rem;
  }

  .post-content {
    padding-left: 2.875rem;
  }

  .event-time {
    margin-top: 0.25rem;
    color: #71717a;
    font-size: 0.8125rem;
  }

  .event-label {
    border: 1px solid transparent;
    border-radius: 9999px;
    background: #f4f4f5;
    padding: 0.25rem 0.625rem;
    color: #3f3f46;
    font-size: 0.75rem;
    font-weight: 600;
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

  .badge-popular {
    border-color: #6d28d9;
    background: #ede9fe;
    color: #6d28d9;
  }

  .event-labels {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    margin-top: 0.625rem;
  }

  :global(.dark) .feed-page {
    background: #000;
  }

  :global(.dark) .feed-menu button {
    color: #d4d4d8;
  }

  :global(.dark) .feed-menu button:hover,
  :global(.dark) .feed-menu button.active {
    background: #27272a;
    color: #6ee7b7;
  }

  :global(.dark) .event-title {
    color: #fafafa;
  }

  :global(.dark) .feed-location,
  :global(.dark) .empty-message,
  :global(.dark) .post-context,
  :global(.dark) .event-time {
    color: #a1a1aa;
  }

  :global(.dark) .filter-panel,
  :global(.dark) .event-card {
    border-color: #3f3f46;
  }

  :global(.dark) .event-card:hover {
    border-color: #52525b;
    box-shadow: 0 8px 20px rgb(0 0 0 / 35%);
  }

  :global(.dark) .filter-panel select {
    border-color: #52525b;
    background: #18181b;
    color: #fafafa;
  }

  :global(.dark) .event-label:not(.badge-green):not(.badge-yellow):not(.badge-maroon):not(.badge-popular) {
    background: #27272a;
    color: #d4d4d8;
  }

  :global(.dark) .event-label.badge-popular {
    background: #3b2b63;
    color: #ddd6fe;
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

  :global(.dark) .group-initial {
    background: #064e3b;
    color: #bae6fd;
  }

  @media (prefers-reduced-motion: reduce) {
    .event-card {
      transition: none;
    }

    .event-card:hover {
      transform: none;
    }
  }

  @media (max-width: 760px) {
    .feed-layout {
      grid-template-columns: 1fr;
      gap: 0.75rem;
      padding: 1rem;
    }

    .feed-menu {
      flex-direction: row;
      padding: 0;
    }

    .feed-menu button {
      flex: 1;
      text-align: center;
    }

    .feed-page {
      padding: 0;
    }
  }

  @media (max-width: 480px) {
    .post-content {
      padding-left: 0;
    }
  }
</style>
