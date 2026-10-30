<script lang="ts">
  type User = NonNullable<App.PageData['user']>

  export let user: User | null = null
</script>

{#if user}
  <span class="hidden"></span>
{:else}
  <a
    href="/login"
    class="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 text-zinc-600 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
  >
    Sign In
  </a>
{/if}
