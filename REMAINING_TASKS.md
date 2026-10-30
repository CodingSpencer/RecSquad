# Remaining Tasks — SvelteKit Port of Bakeoff_1

This document lists the **10 spots** that needed to be completed in order to stand up
the Bakeoff_1 feature set using **SvelteKit** (instead of Next.js) on the `Bakeoff_2`
branch. Each spot maps to the file(s) that implement it.

> Status: all 10 spots are implemented and verified (every route returns HTTP 200;
> `npm run build` passes cleanly).

| # | Spot | Files | Description | Status |
|---|------|-------|-------------|--------|
| 1 | Supabase client & server setup | `frontend/src/lib/supabase/client.ts`<br>`frontend/src/lib/supabase/server.ts`<br>`frontend/src/hooks.server.ts` | Browser + server Supabase clients; auth session exposed on `event.locals`; WebSocket polyfill for Node < 22 | Done |
| 2 | Root layout & navigation | `frontend/src/routes/+layout.svelte`<br>`frontend/src/routes/+layout.server.ts`<br>`frontend/src/lib/components/Navbar.svelte` | Shared layout with sticky navbar (Home / Events / Groups, profile dropdown, sign-in / sign-out) | Done |
| 3 | Home landing page | `frontend/src/routes/+page.svelte`<br>`frontend/src/lib/components/SignInButton.svelte` | Hero section, "Browse Events" CTA, SignInButton, feature cards | Done |
| 4 | Login & signup | `frontend/src/routes/login/+page.svelte`<br>`frontend/src/routes/login/+page.server.ts` | Sign-in / sign-up forms via Supabase Auth with server actions and redirects | Done |
| 5 | Groups list | `frontend/src/routes/groups/+page.svelte`<br>`frontend/src/routes/groups/+page.server.ts` | Browse all groups with a "Create Group" button | Done |
| 6 | Create group | `frontend/src/routes/groups/new/+page.svelte`<br>`frontend/src/routes/groups/new/+page.server.ts` | Group creation form; creator is added as group admin | Done |
| 7 | Group detail | `frontend/src/routes/groups/[id]/+page.svelte`<br>`frontend/src/routes/groups/[id]/+page.server.ts` | View a group; admins see a "Create Event" button | Done |
| 8 | Create event | `frontend/src/routes/groups/[id]/events/new/+page.svelte`<br>`frontend/src/routes/groups/[id]/events/new/+page.server.ts` | Event creation form, admin-gated | Done |
| 9 | User profile | `frontend/src/routes/profile/+page.svelte` | Signed-in user's profile (username, full name, avatar initial) | Done |
| 10 | Settings | `frontend/src/routes/settings/+page.svelte` | Theme (system / light / dark) persistence via localStorage | Done |

## Supporting files (also ported from Bakeoff_1)

- `frontend/package.json` — SvelteKit + Vite + Tailwind v4 + Supabase dependencies
- `frontend/vite.config.ts` — Vite config with Tailwind + SvelteKit plugins
- `frontend/svelte.config.js` — SvelteKit adapter-auto config
- `frontend/tsconfig.json` — extends `.svelte-kit/tsconfig.json` (generated)
- `frontend/src/app.html`, `frontend/src/app.d.ts`, `frontend/src/env.d.ts`, `frontend/src/app.css`
- `frontend/.env.example` — Supabase env variable template
- `frontend/src/routes/about/+page.svelte` — About page
- `frontend/src/routes/events/+page.svelte` — Events page

## Notes

- Supabase credentials live in `frontend/.env.local` (gitignored), copied from
  `frontend/.env.example` using the same project URL/anon key already present in the
  repo root `.env.local`.
- `@supabase/supabase-js` initialises a RealtimeClient (WebSocket) eagerly, and Node.js
  20 does not expose a global `WebSocket`. `frontend/src/hooks.server.ts` polyfills one
  with the `ws` package so the dev/preview server runs on this machine's Node 20.
- Run with: `cd frontend && npm install && npm run dev` (or `npm run preview`).
