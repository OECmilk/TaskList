'use client'

import { useSearchParams } from 'next/navigation'

export default function Messages() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  return (
    <>
      {message && (
        <p className="mt-4 p-4 text-center bg-gray-100 text-gray-800 rounded-md">
          {message}
        </p>
      )}
    </>
  )
}
