<script lang="ts">
  import { enhance } from '$app/forms'
  import type { PageData } from './$types'

  export let data: PageData
</script>

<main class="form-page">
  <h1 class="page-title">Create Group</h1>
  {#if data.error}
    <p class="error-message">{data.error}</p>
  {/if}
  <form method="POST" use:enhance class="form-fields">
    <div>
      <label for="group-name" class="field-label">Name</label>
      <input id="group-name" name="name" placeholder="Name" required class="text-field" />
    </div>
    <div>
      <label for="group-sport" class="field-label">Sport</label>
      <input id="group-sport" name="sport" placeholder="Sport" class="text-field" />
    </div>
    <div>
      <label for="group-description" class="field-label">Description</label>
      <textarea id="group-description" name="description" placeholder="Description" class="text-field"></textarea>
    </div>
    <button class="primary-button">Create</button>
  </form>
  <p class="back-link-container">
    <a href="/groups" class="back-link">← Back to Groups</a>
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
