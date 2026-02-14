'use client';

import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

// クエリパラメータを管理するクライアントコンポーネント
const TaskFilter = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URLの現在のフィルタ状態を取得（デフォルトはtrue）
  const initialFilter = searchParams.get('show_incomplete') !== 'false';
  const [showIncomplete, setShowIncomplete] = useState(initialFilter);

  // チェックボックスの状態が変更されたときの処理
  const handleCheckboxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setShowIncomplete(isChecked);

    // URLのクエリパラメータを更新
    const params = new URLSearchParams(searchParams.toString());

    // trueの場合はパラメータを省略し、falseの場合のみ明示的に'false'を設定
    if (isChecked) {
      params.delete('show_incomplete');
    } else {
      params.set('show_incomplete', 'false');
    }

    // URLを更新し、サーバーコンポーネント側で再フェッチさせる
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  // ブラウザの戻る/進むボタンに対応するため、URL変更時にローカルStateを同期
  useEffect(() => {
    const urlValue = searchParams.get('show_incomplete') !== 'false';
    setShowIncomplete(urlValue);
  }, [searchParams]);

  return (
    <div className="flex items-center gap-1">
      <input
        id="incomplete-filter"
        type="checkbox"
        checked={showIncomplete}
        onChange={handleCheckboxChange}
        className="w-5 h-5 rounded" style={{ accentColor: 'var(--color-accent)' }}
      />
      <label htmlFor="incomplete-filter" className="text-lg font-semibold cursor-pointer select-none" style={{ color: 'var(--color-text-primary)' }}>
        InComplete
      </label>
    </div>
  );
};

export default TaskFilter;