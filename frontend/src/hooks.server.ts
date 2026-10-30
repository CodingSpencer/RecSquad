import { createServerClient } from '@supabase/ssr'
import type { Handle } from '@sveltejs/kit'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'

// Node.js < 22 does not expose a global WebSocket, but @supabase/supabase-js
// eagerly initialises a RealtimeClient on construction. Polyfill one so the
// server-side Supabase client can be created in this environment.
import { WebSocket as WebSocketImpl } from 'ws'
if (!globalThis.WebSocket) {
  globalThis.WebSocket = WebSocketImpl as unknown as typeof WebSocket
}

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => event.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            event.cookies.set(name, value, { ...options, path: '/' })
          })
        },
      },
    }
  )

  event.locals.safeGetSession = async () => {
    const { data: { session } } = await event.locals.supabase.auth.getSession()
    if (!session) return { session: null, user: null }

    const { data: { user }, error } = await event.locals.supabase.auth.getUser()
    if (error) {
      // JWT validation failed or expired
      return { session: null, user: null }
    }

    return { session, user }
  }

  // event.locals.session = await event.locals.supabase.auth.getSession()

  const response = await resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range' || name === 'x-supabase-api-version'
    },
  })

  return response
}
