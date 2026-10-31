<script lang="ts">
  import { enhance } from '$app/forms'
  import type { ActionData } from './$types'

  export let form: ActionData
  let recurring = false
  let noEndDate = true

  function setTimezoneOffset(event: SubmitEvent) {
    const formElement = event.currentTarget
    if (!(formElement instanceof HTMLFormElement)) return

    const startTimeInput = formElement.elements.namedItem('start_time')
    const timezoneOffsetInput = formElement.elements.namedItem('timezone_offset')
    if (
      !(startTimeInput instanceof HTMLInputElement) ||
      !(timezoneOffsetInput instanceof HTMLInputElement) ||
      !startTimeInput.value
    ) {
      return
    }

    timezoneOffsetInput.value = String(new Date(startTimeInput.value).getTimezoneOffset())
  }
</script>

<main class="form-page">
  <h1 class="page-title">Create Event</h1>
  {#if form?.error}
    <p class="error-message" role="alert">{form.error}</p>
  {/if}
  <form method="POST" use:enhance onsubmit={setTimezoneOffset} class="form-fields">
    <div>
      <label for="event-title" class="field-label">Title</label>
      <input id="event-title" name="title" placeholder="Title" required class="text-field" />
    </div>
    <div>
      <label for="event-skill-level" class="field-label">Skill level</label>
      <select id="event-skill-level" name="skill_level" required class="text-field">
        <option value="Beginner">Beginner</option>
        <option value="Intermediate">Intermediate</option>
        <option value="Experienced">Experienced</option>
      </select>
    </div>
    <div>
      <label for="event-style" class="field-label">Event style</label>
      <select id="event-style" name="event_style" required class="text-field">
        <option value="Casual">Casual</option>
        <option value="Competitive">Competitive</option>
        <option value="Tournament">Tournament</option>
      </select>
    </div>
    <div>
      <label for="event-type" class="field-label">Event type</label>
      <select id="event-type" name="event_type" required class="text-field">
        <option value="Pick Up">Pick Up</option>
        <option value="Practice">Practice</option>
        <option value="Game">Game</option>
        <option value="Info">Info</option>
      </select>
    </div>
    <div>
      <label for="event-date" class="field-label">Date & time</label>
      <input id="event-date" type="datetime-local" name="start_time" required class="text-field" />
    </div>
    <div>
      <label for="event-city" class="field-label">City</label>
      <input id="event-city" name="city" placeholder="City" required class="text-field" />
    </div>
    <div>
      <label for="event-state" class="field-label">State</label>
      <input id="event-state" name="state" placeholder="State" required class="text-field" />
    </div>
    <label class="checkbox-label">
      <input type="checkbox" name="is_recurring" value="true" bind:checked={recurring} />
      Repeat this event weekly
    </label>
    {#if recurring}
      <fieldset class="recurrence-fields">
        <legend class="field-label">Day(s) of the week</legend>
        <div class="weekday-list">
          {#each ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as day}
            <label class="checkbox-label">
              <input type="checkbox" name="recurrence_days" value={day} />
              {day}
            </label>
          {/each}
        </div>
        <label class="checkbox-label">
          <input type="checkbox" name="no_end_date" value="true" bind:checked={noEndDate} />
          No end date
        </label>
        {#if !noEndDate}
          <div>
            <label for="recurrence-end-date" class="field-label">Repeat until</label>
            <input id="recurrence-end-date" type="date" name="recurrence_end_date" required class="text-field" />
          </div>
        {/if}
      </fieldset>
    {/if}
    <input type="hidden" name="timezone_offset" value="0" />
    <button class="primary-button">Create</button>
  </form>
  <p class="back-link-container">
    <a href=".." class="back-link">← Back to Group</a>
  </p>
</main>

<style>
  .form-page {
    max-width: 28rem;
    margin: 0 auto;
    padding: 1.5rem;
  }

  .page-title {
    margin-bottom: 1rem;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .error-message {
    margin-bottom: 1rem;
    border: 1px solid #fecaca;
    border-radius: 0.25rem;
    background: #fef2f2;
    padding: 0.75rem;
    font-size: 0.875rem;
    color: #dc2626;
  }

  .form-fields {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .field-label {
    display: block;
    margin-bottom: 0.25rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #3f3f46;
  }

  .recurrence-fields {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    border: 1px solid #e4e4e7;
    border-radius: 0.375rem;
    padding: 0.75rem;
  }

  .weekday-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #3f3f46;
  }

  .text-field {
    width: 100%;
    border: 1px solid #d4d4d8;
    border-radius: 0.25rem;
    background: #fff;
    padding: 0.5rem;
    color: #18181b;
  }

  .primary-button {
    width: fit-content;
    border-radius: 0.25rem;
    background: #059669;
    padding: 0.5rem 1rem;
    color: #fff;
    font-weight: 500;
    transition: background-color 150ms;
  }

  .primary-button:hover {
    background: #047857;
  }

  .back-link-container {
    margin-top: 1rem;
    text-align: center;
    font-size: 0.875rem;
    color: #71717a;
  }

  .back-link {
    color: #059669;
  }

  .back-link:hover {
    text-decoration: underline;
  }

  :global(.dark) .error-message {
    border-color: #7f1d1d;
    background: rgb(127 29 29 / 0.2);
    color: #f87171;
  }

  :global(.dark) .field-label {
    color: #d4d4d8;
  }

  :global(.dark) .recurrence-fields {
    border-color: #3f3f46;
  }

  :global(.dark) .checkbox-label {
    color: #d4d4d8;
  }

  :global(.dark) .text-field {
    border-color: #3f3f46;
    background: #27272a;
    color: #f4f4f5;
  }

  :global(.dark) .back-link-container {
    color: #a1a1aa;
  }

  :global(.dark) .back-link {
    color: #34d399;
  }
</style>
