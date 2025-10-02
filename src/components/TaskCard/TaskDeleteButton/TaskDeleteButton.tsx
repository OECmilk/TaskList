'use client';

import { useState } from "react";
import { deleteTask } from "@/app/actions";
import { FaTrashAlt } from "react-icons/fa";

interface TaskDeleteButtonProps {
    id: number;
}

const TaskDeleteButton: React.FC<TaskDeleteButtonProps> = ({ id }) => {
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  // モーダルを開く
  const handleOpenModal = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.preventDefault();
      setIsModalOpen(true);
    };
  // モーダルを閉じる  
  const handleCloseModal = (e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
      e.stopPropagation();
      e.preventDefault();
      setIsModalOpen(false);
    };

  return (
    <>
      {/* ゴミ箱アイコンのボタン。クリックでモーダルを開くように変更 */}
      <button
        type="button"
        onClick={handleOpenModal}
        className="mt-3 hover:text-gray-600 text-lg cursor-pointer"
      >
        <FaTrashAlt />
      </button>

      {/* isModalOpenがtrueのときにモーダルを表示 */}
      {isModalOpen && (
        <div 
          onClick={handleCloseModal} 
          className="fixed inset-0 bg-black/80 flex justify-center items-center z-50"
        >
          <div 
            // モーダルの中身をクリックしても閉じないようにイベントの伝播を停止
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-8 rounded-lg shadow-xl text-center w-full max-w-md mx-4"
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-800">本当に削除しますか？</h2>
            <p className="text-gray-600 mb-8">この操作は元に戻すことができません。</p>

            <div className="flex justify-center gap-4">
              
              {/* Deleteボタン（Server Actionを実行するフォーム） */}
              <form action={deleteTask}>
                  <input type="hidden" name="id" value={id} />
                  <button
                      type="submit"
                      className="px-8 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 font-semibold transition-colors"
                  >
                      Delete
                  </button>
              </form>

              {/* Cancelボタン */}
              <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-8 py-2 rounded-md text-gray-800 bg-gray-200 hover:bg-gray-300 font-semibold transition-colors"
              >
                  Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskDeleteButton;