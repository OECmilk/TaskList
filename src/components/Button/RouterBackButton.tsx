'use client';

import { useRouter } from 'next/navigation';
import { FaArrowRight } from "react-icons/fa";
import { useState } from 'react'; // 1. useStateをインポート

const RouterBackButton = () => {
    const router = useRouter();
    // 2. アニメーション実行中かを管理するstate
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        // 3. 親要素であるドロワーパネル（アニメーションクラスを持っている要素）を見つける
        //    '.animate-slideInFromRight'クラスを目印に探します
        const panel = e.currentTarget.closest('.animate-slideInFromRight');

        if (panel) {
            setIsClosing(true); // ボタンを無効化
            
            // 4. アニメーションクラスを「スライドイン」から「スライドアウト」に付け替える
            panel.classList.remove('animate-slideInFromRight');
            panel.classList.add('animate-slideOutToRight');

            // 5. アニメーション時間(300ms)の後に、router.back()を実行
            setTimeout(() => {
                router.push('/');
            }, 300); // globals.cssで設定した 0.3s と合わせる
        } else {
            // もし何らかの理由でパネルが見つからなければ、即座に戻る
            router.push('/');
        }
    }

    return (
        <button
            onClick={handleClose}
            disabled={isClosing} // 6. アニメーション実行中はボタンを無効化
            className="text-gray-500 hover:text-gray-800 disabled:opacity-50"
        >
            <FaArrowRight size={24} />
        </button>
    );
}
export default RouterBackButton;

