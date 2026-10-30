/// <reference types="@sveltejs/kit" />
import type { SupabaseClient, Session, User } from '@supabase/supabase-js'

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient
      safeGetSession: () => Promise<{ session: Session | null; user: User | null }>
    }
    interface PageData {
      user?: Pick<User, 'id' | 'email'> | null
      profile?: {
        username: string | null
        full_name: string | null
        avatar_url: string | null
      } | null
    }
    interface Platform {}
    interface Stuff {}
  }
}
