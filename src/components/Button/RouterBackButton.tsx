'use client';

import { useRouter } from 'next/navigation';
import { FaArrowRight } from "react-icons/fa";
import { useState } from 'react'; 

interface RouterBackButtonProps {
    returnPath: string; // 戻り先のパスを受け取る
}

const RouterBackButton = ({ returnPath }: RouterBackButtonProps) => {
    const router = useRouter();
    const [isClosing, setIsClosing] = useState(false);

    const navigateBackOrReplace = () => {

        router.push(returnPath);
    };

    const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (isClosing) return;
        setIsClosing(true);

        const panel = e.currentTarget.closest('.animate-slideInFromRight, .animate-slideOutToRight');

        if (panel) {
            panel.classList.remove('animate-slideInFromRight');
            panel.classList.add('animate-slideOutToRight');

            // アニメーション完了後に履歴に応じて戻る／置き換え
            setTimeout(() => {
                navigateBackOrReplace();
            }, 300);
        } else {
            navigateBackOrReplace();
        }
    }

    return (
        <button
            onClick={handleClose}
            disabled={isClosing}
            className="text-gray-500 hover:text-gray-800 disabled:opacity-50"
        >
            <FaArrowRight size={24} />
        </button>
    );
}
export default RouterBackButton;