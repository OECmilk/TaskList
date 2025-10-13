import { Suspense } from 'react';
import { submitContactForm } from '@/app/actions';
import Messages from '@/app/auth/login/messages'; // パスを正しい場所に変更

export default function ContactPage() {
  return (
    <div className="p-8 sm:p-10 h-full overflow-y-auto text-gray-800">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Contact Us</h1>
        <p className="text-gray-600 mt-2">
          バグの報告や、実装してほしい機能のご要望など、お気軽にお寄せください。
        </p>
      </header>

      <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <form action={submitContactForm}>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="Your message..."
              ></textarea>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-700 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
              >
                Send Message
              </button>
            </div>
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
