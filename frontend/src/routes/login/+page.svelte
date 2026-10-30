<script lang="ts">
  import { enhance } from '$app/forms'
  import type { PageData } from './$types'

  export let data: PageData
  let mode = 'login' // 'login' | 'signup'
</script>

<main class="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black px-4">
  <div class="w-full max-w-md">
    <div class="bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-md">
      <h1 class="text-2xl font-bold mb-6 text-center">{mode === 'signup' ? 'Create Account' : 'Sign In'}</h1>

      {#if data.error}
        <p class="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-800">{data.error}</p>
      {/if}

      <form method="POST" action="?/{mode}" use:enhance>
        <div class="mb-4">
          <label for="login-email" class="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">Email</label>
          <input
            id="login-email"
            name="email"
            type="email"
            required
            class="w-full border rounded p-2 text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800"
          />
        </div>
        <div class="mb-4">
          <label for="login-password" class="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">Password</label>
          <input
            id="login-password"
            name="password"
            type="password"
            required
            class="w-full border rounded p-2 text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800"
          />
        </div>
        {#if mode === 'signup'}
          <div class="mb-4">
            <label for="signup-username" class="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">Username</label>
            <input id="signup-username" name="username" required class="w-full border rounded p-2 text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800" />
          </div>
          <div class="mb-6">
            <label for="signup-full-name" class="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">Full name</label>
            <input id="signup-full-name" name="full_name" class="w-full border rounded p-2 text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800" />
          </div>
        {/if}

        <button
          type="submit"
          name="action"
          class="w-full bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition font-medium"
        >
          {mode === 'signup' ? 'Create Account' : 'Sign In'}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        {mode === 'login'
          ? "Don't have an account? "
          : 'Already have an account? '
        }
        <button
          onclick={() => (mode = mode === 'login' ? 'signup' : 'login')}
          class="font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          {mode === 'login' ? 'Sign up' : 'Sign in'}
        </button>
      </p>
      <p class="mt-3 text-center text-sm text-zinc-500 dark:text-zinc-500">
        <a href="/" class="text-emerald-600 dark:text-emerald-400 hover:underline">← Back to Home</a>
      </p>
    </div>
  </div>
</main>
