<script lang="ts">
  import { enhance } from '$app/forms'
  import type { ActionData } from './$types'

  export let form: ActionData
  let mode = 'login' // 'login' | 'signup'
</script>

<main class="login-page">
  <div class="login-container">
    <div class="login-card">
      <h1 class="login-title">{mode === 'signup' ? 'Create Account' : 'Sign In'}</h1>

      {#if form?.error}
        <p class="error-message">{form.error}</p>
      {/if}

      <form method="POST" action="?/{mode}" use:enhance class="login-form">
        <div class="field-group">
          <label for="login-email" class="field-label">Email</label>
          <input
            id="login-email"
            name="email"
            type="email"
            required
            class="text-field"
          />
        </div>
        <div class="field-group">
          <label for="login-password" class="field-label">Password</label>
          <input
            id="login-password"
            name="password"
            type="password"
            required
            class="text-field"
          />
        </div>
        {#if mode === 'signup'}
          <div class="field-group">
            <label for="signup-username" class="field-label">Username</label>
            <input id="signup-username" name="username" required class="text-field" />
          </div>
          <div class="field-group last-field">
            <label for="signup-full-name" class="field-label">Full name</label>
            <input id="signup-full-name" name="full_name" class="text-field" />
          </div>
        {/if}

        <button
          type="submit"
          name="action"
          class="submit-button"
        >
          {mode === 'signup' ? 'Create Account' : 'Sign In'}
        </button>
      </form>

      <p class="mode-prompt">
        {mode === 'login'
          ? "Don't have an account? "
          : 'Already have an account? '
        }
        <button
          onclick={() => (mode = mode === 'login' ? 'signup' : 'login')}
          class="mode-toggle"
        >
          {mode === 'login' ? 'Sign up' : 'Sign in'}
        </button>
      </p>
      <p class="home-link-container">
        <a href="/" class="home-link">← Back to Home</a>
      </p>
    </div>
  </div>
</main>

<style>
  .login-page {
    display: flex;
    min-height: 100vh;
    align-items: center;
    justify-content: center;
    background: #f9fafb;
    padding: 0 1rem;
  }

  .login-container {
    width: 100%;
    max-width: 28rem;
  }

  .login-card {
    border-radius: 0.75rem;
    background: #fff;
    padding: 2rem;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  }

  .login-title {
    margin-bottom: 1.5rem;
    text-align: left;
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

  .login-form {
    display: flex;
    flex-direction: column;
  }

  .field-group {
    margin-bottom: 1rem;
  }

  .field-group.last-field {
    margin-bottom: 1.5rem;
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

  .submit-button {
    width: 100%;
    border-radius: 0.25rem;
    background: #059669;
    padding: 0.5rem 1rem;
    color: #fff;
    font-weight: 500;
    transition: background-color 150ms;
  }

  .submit-button:hover {
    background: #047857;
  }

  .mode-prompt {
    margin-top: 1.5rem;
    text-align: center;
    font-size: 0.875rem;
    color: #52525b;
  }

  .mode-toggle {
    font-weight: 500;
    color: #059669;
  }

  .mode-toggle:hover,
  .home-link:hover {
    text-decoration: underline;
  }

  .home-link-container {
    margin-top: 0.75rem;
    text-align: center;
    font-size: 0.875rem;
    color: #71717a;
  }

  .home-link {
    color: #059669;
  }

  :global(.dark) .login-page {
    background: #000;
  }

  :global(.dark) .login-card {
    background: #18181b;
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

  :global(.dark) .mode-prompt {
    color: #a1a1aa;
  }

  :global(.dark) .mode-toggle,
  :global(.dark) .home-link {
    color: #34d399;
  }
</style>
