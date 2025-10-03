import { Suspense } from 'react';
import { login, signup, signInWithOAuth } from '@/app/auth/actions';
import { FaGithub, FaGoogle } from "react-icons/fa";
import Messages from './messages';

export default function LoginPage() {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center text-gray-900">
                    Welcome
                </h1>

                {/* --- Email/Password Form --- */}
                <form className="space-y-6">
                    <div>
                        <label
                            htmlFor="name"
                            className="text-sm font-medium text-gray-700"
                        >
                            Username
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="email"
                            className="text-sm font-medium text-gray-700"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="password"
                            className="text-sm font-medium text-gray-700"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            minLength={6}
                            placeholder="6 characters minimum"
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            formAction={login}
                            className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Sign In
                        </button>
                        <button
                            type="submit"
                            formAction={signup}
                            className="w-full px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-md hover:bg-indigo-50"
                        >
                            Sign Up
                        </button>
                    </div>
                </form>

                {/* --- Separator --- */}
                <div className="flex items-center">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="mx-4 text-sm text-gray-500">OR</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                {/* --- OAuth Buttons --- */}
                <div className="space-y-4">
                    <form action={signInWithOAuth}>
                        <input type="hidden" name="provider" value="google" />
                        <button
                            type="submit"
                            className="w-full flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                        >
                            <FaGoogle />
                            Continue with Google
                        </button>
                    </form>
                    <form action={signInWithOAuth}>
                        <input type="hidden" name="provider" value="github" />
                        <button
                            type="submit"
                            className="w-full flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                        >
                            <FaGithub />
                            Continue with GitHub
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
