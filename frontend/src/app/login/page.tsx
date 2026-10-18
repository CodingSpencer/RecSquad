import { Suspense } from 'react'
import { login, signup } from './actions'

async function LoginContent({
    searchParams,
}: {
    searchParams: Promise<{ message?: string }>
}) {
    const params = await searchParams;
    const message = params.message;

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-md border border-gray-100">
                
                <header className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">RecSquad</h1>
                <p className="text-sm text-gray-500">Sign in to your account</p>
                </header>

                <form className="space-y-4">
                <FormInput label="Email Address" id="email" type="email" placeholder="you@example.com" />
                <FormInput label="Password" id="password" type="password" placeholder="••••••••" />

                {message && <p className="text-sm text-red-500 text-center">{message}</p>}

                <div className="flex gap-3 pt-2">
                    <button formAction={login} className="w-full rounded-lg bg-indigo-600 py-2 text-white font-medium hover:bg-indigo-700 transition">
                    Log In
                    </button>
                    <button formAction={signup} className="w-full rounded-lg bg-gray-800 py-2 text-white font-medium hover:bg-gray-900 transition">
                    Sign Up
                    </button>
                </div>
                </form>

            </div>
        </main>
    )
}

export default function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ message?: string }>
}) {
    return (
        <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-gray-50 px-4"><div className="text-gray-500">Loading...</div></main>}>
            <LoginContent searchParams={searchParams} />
        </Suspense>
    )
}

function FormInput({ label, id, type, placeholder }: { label: string; id: string; type: string; placeholder: string }) {
    return (
        <div>
        <label className="block text-xs font-semibold uppercase text-gray-600 mb-1" htmlFor={id}>
            {label}
        </label>
        <input
            id={id}
            name={id}
            type={type}
            required
            placeholder={placeholder}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        </div>
    )
}