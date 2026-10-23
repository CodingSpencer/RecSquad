export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Find your game. Join your squad.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            RecSquad connects players with local sports groups and events. Create
            a profile, browse upcoming games, and RSVP in seconds.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            href="/events"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 text-white transition-colors hover:bg-indigo-700 dark:hover:bg-indigo-600 md:w-[158px]"
          >
            Browse Events
          </a>
          <a
            href="/login"
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 text-zinc-600 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
          >
            Sign In
          </a>
        </div>

        <section className="mt-20 flex flex-col items-center justify-between gap-12 py-16 px-16 border-t border-zinc-200 dark:border-zinc-800 sm:flex-row">
          <div className="flex flex-col items-center gap-4 text-center sm:text-left">
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
              Browse Events
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              See upcoming games and RSVP with one click.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4 text-center sm:text-left">
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
              Player Profile
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              Track your sports and skill level.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4 text-center sm:text-left">
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
              Group Discovery
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              Find local groups for your favorite sports.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
