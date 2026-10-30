/// <reference types="@sveltejs/kit" />
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Session } from '@supabase/supabase-js'

declare namespace App {
  interface Locals {
    supabase: SupabaseClient
    session: Session | null
  }
  interface PageData {
    session: Session | null
  }
  interface Platform {}
  interface Stuff {}
}
