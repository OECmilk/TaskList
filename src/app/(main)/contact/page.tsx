import { Suspense } from 'react';
import { submitContactForm } from '@/app/actions';
import Messages from '@/app/auth/login/messages';

export default function ContactPage() {
  return (
    <div className="p-8 sm:p-10 h-full overflow-y-auto" style={{ color: 'var(--color-text-primary)' }}>
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Contact Us</h1>
        <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
          バグの報告や、実装してほしい機能のご要望など、お気軽にお寄せください。
        </p>
      </header>

      <div className="card max-w-xl mx-auto p-8">
        <form action={submitContactForm}>
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="message" className="block text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                required
                className="input-field resize-none"
                placeholder="Your message..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3 hover:opacity-80 cursor-pointer"
            >
              Send Message
            </button>
          </div>
        </form>

        {/* 送信後のメッセージ表示エリア */}
        <div className="mt-6">
          <Suspense fallback={null}>
            <Messages />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
