import { Suspense } from 'react'
import { login, signup } from './actions'

async function LoginContent({
    searchParams,
}: {
    searchParams: Promise<{ message?: string; mode?: string }>
}) {
    const params = await searchParams;
    const message = params.message;
    const isSignup = params.mode === 'signup';

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-md border border-gray-100">
                
                <header className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">RecSquad</h1>
                <p className="text-sm text-gray-500">
                    {isSignup ? 'Create your account' : 'Sign in to your account'}
                </p>
                </header>

                <form className="space-y-4">
                {isSignup && (
                    <>
                    <FormInput label="Username" id="username" type="text" placeholder="yourname" />
                    <FormInput label="Full Name" id="full_name" type="text" placeholder="Jane Doe" />
                    </>
                )}
                <FormInput label="Email Address" id="email" type="email" placeholder="you@example.com" />
                <FormInput label="Password" id="password" type="password" placeholder="••••••••" />

                {message && <p className="text-sm text-red-500 text-center">{message}</p>}

                <button
                    formAction={isSignup ? signup : login}
                    className="w-full rounded-lg bg-emerald-600 py-2 text-white font-medium hover:bg-emerald-700 transition"
                >
                    {isSignup ? 'Create Account' : 'Log In'}
                </button>
                </form>

                <p className="text-center text-sm text-gray-500">
                    {isSignup ? (
                        <>Already have an account? <a href="/login" className="text-emerald-600 font-medium hover:underline">Login</a></>
                    ) : (
                        <>Don't have an account? <a href="/login?mode=signup" className="text-emerald-600 font-medium hover:underline">Create Account</a></>
                    )}
                </p>

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
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        </div>
    )
}