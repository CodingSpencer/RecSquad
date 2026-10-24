'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    console.log('Sign in attempt:', data.email, error ? `FAILED: ${error.message}` : 'SUCCESS')

    if (error) {
        redirect(`/login?message=${encodeURIComponent(error.message)}`)
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const username = formData.get('username') as string
    const full_name = formData.get('full_name') as string

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { username, full_name },
        },
    })

    if (error) {
        redirect(`/login?message=${encodeURIComponent(error.message)}&mode=signup`)
    }

    // Best-effort: populate the profiles row if a session is available.
    if (data.user) {
        await supabase.from('profiles').upsert({
            id: data.user.id,
            username,
            full_name,
            updated_at: new Date().toISOString(),
        })
    }

    revalidatePath('/', 'layout')
    redirect('/')
}