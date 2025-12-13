'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Provide a global type for gtag so accessing window.gtag does not error in TypeScript
declare global {
  interface Window {
    // 💡 修正: any[] を unknown[] に変更し、Linterエラーを回避
    gtag?: (...args: unknown[]) => void;
  }
}

// GA4の測定IDを環境変数から取得
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// GA4のページビューを送信する関数
const pageview = (url: string) => {
  if (window.gtag && GA_ID) { // 💡 GA_IDのnullチェックを追加
    window.gtag('config', GA_ID, {
      page_path: url,
    });
  }
};

const GoogleAnalytics = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URLが変わるたびにページビューを送信
  useEffect(() => {
    if (!GA_ID) return;

    // GA4のライブラリが読み込まれていない場合はスキップ
    if (typeof window.gtag !== 'function') return;

    const url = pathname + searchParams.toString();
    pageview(url);
  }, [pathname, searchParams]);

  if (!GA_ID) {
    return null; // GA_IDがない場合は何もレンダリングしない
  }

  return (
    <>
      {/* 💡 gtag.js の初期化スクリプト */}
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `,
        }}
      />
    </>
  );
};

export default GoogleAnalytics;