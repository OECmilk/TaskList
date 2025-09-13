'use client';

import Link from "next/link";

const error = () => {
  return (
    <div className="h-screen flex flex-col justify-center items-center bg-slate-50 text-gray-900">
        <h1 className="text-8xl font-bold">Error</h1>
        <p className="text-4xl font-medium">Unexpected error occurred</p>
        <Link href="/" className="mt-4 text-xl text-blue-600 hover:underline">Go back home</Link>
    </div>
  );
}

export default error