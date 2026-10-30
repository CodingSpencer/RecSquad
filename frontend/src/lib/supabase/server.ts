/**
 * Typed accessors for the Supabase server client and session exposed on
 * `event.locals` by `src/hooks.server.ts`.
 */
export function getSupabaseClient(locals: App.Locals) {
  return locals.supabase
}

export async function getSession(locals: App.Locals) {
  const { session } = await locals.safeGetSession()
  return session
}

export type PageData = App.PageData
