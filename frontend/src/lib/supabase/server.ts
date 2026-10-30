import type { Locals, PageData } from '$types'

/**
 * Typed accessors for the Supabase server client and session exposed on
 * `event.locals` by `src/hooks.server.ts`.
 */
export function getSupabaseClient(locals: Locals) {
  return locals.supabase
}

export function getSession(locals: Locals) {
  return locals.session
}

export type { PageData }
