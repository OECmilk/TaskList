'use client';

import Link from "next/link";

const ErrorPage = () => {
  return (
    <div className="h-screen flex flex-col justify-center items-center gap-4" style={{ background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}>
      <h1 className="text-8xl font-bold" style={{ color: 'var(--color-accent)' }}>Error</h1>
      <p className="text-xl font-medium" style={{ color: 'var(--color-text-secondary)' }}>Unexpected error occurred</p>
      <Link href="/" className="btn-primary mt-4">Go back home</Link>
    </div>
  );
}

export default ErrorPage;