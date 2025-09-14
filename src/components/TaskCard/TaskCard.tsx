'use client';

import { useState } from "react";
import TaskDeleteButton from "./TaskDeleteButton/TaskDeleteButton";
import TaskCompleteButton from "./TaskCompleteButton/TaskCompleteButton";
import { Task } from "@/app/(main)/page";
import Link from "next/link";
import { FaCheck } from "react-icons/fa";

const TaskCard = ({ task }: { task: Task }) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  return (
    <Link
        href={`/edit/${task.id}`} 
        prefetch={true}
        className="w-64 h-52 p-4 bg-white rounded-md shadow-md flex flex-col justify-between">
        <header>
            <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                <TaskCompleteButton id={ task.id } status={ task.status }/>
            </div>
            <h1 className="text-lg font-semibold">{ task.title }</h1>
            <div className="mt-1 text-sm line-clamp-3">{ task.description }</div>
        </header>
        <div>
            <div className="text-sm">{ task.due_date }</div>
            <div className="flex justify-between items-center">
                <div
                    className="relative"
                    onMouseEnter={() => setIsDropdownVisible(true)} // ホバー時に表示
                    onMouseLeave={() => setIsDropdownVisible(false)}// ホバー終了で非表示
                >
                    <div className="w-40 mt-1 text-sm px-2 py-1 w-24 text-center font-bold border-1 shadow-sm">
                        SubTasks
                    </div>

                    {/* 4. isDropdownVisibleがtrue、かつサブタスクが存在する場合にプルダウンメニューを表示 */}
                    {isDropdownVisible && task.sub_tasks && task.sub_tasks.length > 0 && (
                    <div
                    className="absolute top-full left-0 w-40 bg-white border shadow-lg z-10"
                    onClick={(e) => e.stopPropagation()}
                    >
                    <ul className="py-1 max-h-40 overflow-y-auto">
                        {task.sub_tasks.map(subtask => (
                        <li key={subtask.id} className="flex justify-between items-center px-4 py-2 text-sm text-gray-700 truncate">
                            <span className="truncate">{subtask.title}</span>
                            {/* 2. subtask.statusがtrueの場合に緑色のチェックマークを表示 */}
                            {subtask.status && (
                                <FaCheck className="text-green-500 ml-2 flex-shrink-0" />
                            )}
                        </li>
                        ))}
                    </ul>
                    </div>
                    )}
                </div>
                <div className="flex gap-4" onClick={(e) => e.stopPropagation()}>
                    <TaskDeleteButton id={ task.id }/>
                </div>
            </div>
        </div>
    </Link>
  )
}

export default TaskCard;