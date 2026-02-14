import { Suspense } from 'react';
import { login, signup, signInWithOAuth } from '@/app/auth/actions';
import { FaGithub } from "react-icons/fa";
import Messages from './messages';
import GoogleIcon from '@/components/icons/GoogleIcon';
import ReadEchoesIcon from '@/components/icons/ReadEchoesIcon';

export default function LoginPage() {
    return (
        <div className="flex justify-center items-center h-full" style={{ background: 'var(--color-bg)' }}>
            <div className="card w-full max-w-md p-8 space-y-5 mx-4">
                <h1 className="text-2xl font-bold text-center" style={{ color: 'var(--color-text-primary)' }}>
                    Welcome
                </h1>

                {/* --- Email/Password Form --- */}
                <form className="space-y-5">
                    <div className="space-y-1.5">
                        <label htmlFor="name" className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                            Username
                        </label>
                        <input id="name" name="name" type="text" required className="input-field" />
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="email" className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                            Email
                        </label>
                        <input id="email" name="email" type="email" required className="input-field" />
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="password" className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            minLength={6}
                            placeholder="6 characters minimum"
                            className="input-field"
                        />
                    </div>
                    <div className="flex gap-3 pt-1">
                        <button type="submit" formAction={login} className="btn-primary flex-1">
                            Sign In
                        </button>
                        <button type="submit" formAction={signup} className="btn-secondary flex-1">
                            Sign Up
                        </button>
                    </div>
                </form>

                {/* --- Separator --- */}
                <div className="flex items-center gap-4">
                    <div className="flex-grow h-px" style={{ background: 'var(--color-border)' }} />
                    <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>OR</span>
                    <div className="flex-grow h-px" style={{ background: 'var(--color-border)' }} />
                </div>

                {/* --- OAuth Buttons --- */}
                <div className="space-y-3">
                    <form action={signInWithOAuth}>
                        <input type="hidden" name="provider" value="google" />
                        <button
                            type="submit"
                            className="btn-secondary w-full flex justify-center items-center gap-2"
                        >
                            <GoogleIcon />
                            Continue with Google
                        </button>
                    </form>
                    <form action={signInWithOAuth}>
                        <input type="hidden" name="provider" value="github" />
                        <button
                            type="submit"
                            className="btn-secondary w-full flex justify-center items-center gap-2"
                        >
                            <FaGithub className='size-5' />
                            Continue with GitHub
                        </button>
                    </form>

                    <form action={signInWithOAuth}>
                        <input type="hidden" name="provider" value="readEchoes" />
                        <button
                            type="submit"
                            className="btn-secondary w-full flex justify-center items-center gap-2"
                        >
                            <ReadEchoesIcon className='size-5' />
                            Continue with ReadEchoes
                        </button>
                    </form>
                </div>

                {/* --- Display Message with Suspense --- */}
                <Suspense fallback={null}>
                    <Messages />
                </Suspense>

            </div>
        </div>
    );
}
