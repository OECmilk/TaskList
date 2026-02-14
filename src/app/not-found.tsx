import Link from "next/link";

const NotFoundPage = () => {
  return (
    <div className="h-screen flex flex-col justify-center items-center gap-4" style={{ background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}>
      <h1 className="text-8xl font-bold" style={{ color: 'var(--color-accent)' }}>404</h1>
      <p className="text-xl font-medium" style={{ color: 'var(--color-text-secondary)' }}>Page Not Found</p>
      <Link href="/" className="btn-primary mt-4">Go back home</Link>
    </div>
  )
};

export default NotFoundPage;