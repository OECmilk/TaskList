'use client';

import { useState } from "react";
import TaskDeleteButton from "./TaskDeleteButton/TaskDeleteButton";
import TaskCompleteButton from "./TaskCompleteButton/TaskCompleteButton";
import ProgressBar from "./ProgressBar/ProgressBar";
import { Task } from "@/app/(main)/page";
import Link from "next/link";
import { FaCheck } from "react-icons/fa";
import { FaRegClock } from "react-icons/fa6";

const TaskCard = ({ task }: { task: Task }) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  // タスクの進捗を計算
  const totalSubTasks = task.sub_tasks ? task.sub_tasks.length : 0;
  const completedSubTasks = task.sub_tasks ? task.sub_tasks.filter(subtask => subtask.status).length : 0;

  const today = new Date().toISOString().split('T')[0]; // 今日の日付
  const isOverdue = task.due_date < today && task.status === false; // 期限切れかつ未完了のタスクかどうか

  return (
    <div className="relative mt-4">
      
      {/* 2. プロジェクトが存在する場合にのみ、タブを絶対配置で表示 */}
      {task.project_id  && (
        <div className="absolute top-0 left-0 w-1/3 -translate-y-full bg-white px-3 py-1 rounded-t-md shadow-sm text-xs font-bold text-gray-700 text-center truncate z-1 border-x border-t border-orange-100">
          {task.projects?.name}
        </div>
      )}

        <Link
            href={`/edit/${task.id}`} 
            prefetch={true}
            className="w-80 h-60 sm:w-64 sm:h-54 p-3 bg-white rounded-b-md rounded-tr-md shadow-md flex flex-col justify-between border border-orange-100"
        >
            <header>
                <div className="flex justify-between" onClick={(e) => e.stopPropagation()}>
                    <ProgressBar total={totalSubTasks} completed={completedSubTasks} status={task.status}/>
                    <TaskCompleteButton id={ task.id } status={ task.status }/>
                </div>
                <h1 className="text-lg font-semibold truncate">{ task.title }</h1>
                <div className="mt-1 text-sm line-clamp-3">{ task.description }</div>
            </header>
            <div>
                <div className="flex justify-between">
                    <div className="text-sm pt-3 flex justify-between">
                        { task.due_date }

                        {/* タスクの期限がきれている場合、時計マークを表示 */}
                        {isOverdue && (
                        <div className="text-orange-400 ml-1" title="期限切れ">
                            <FaRegClock className="size-3.5" />
                        </div>
                    )}
                    </div>
                    <div className="" onClick={(e) => e.stopPropagation()}>
                        <TaskDeleteButton id={ task.id }/>
                    </div>
                </div>
                <hr className="my-1"></hr>
                <div 
                className="items-center" 
                onClick={(e) => {
                    e.stopPropagation(); 
                    e.preventDefault();
                }}>
                    <div
                        className="relative"
                        onMouseEnter={() => setIsDropdownVisible(true)} // ホバー時に表示
                        onMouseLeave={() => setIsDropdownVisible(false)}// ホバー終了で非表示
                    >
                        <div className="mt-1 text-sm w-full text-center font-bold">
                            SubTasks
                        </div>

                        {/* 4. isDropdownVisibleがtrue、かつサブタスクが存在する場合にプルダウンメニューを表示 */}
                        {isDropdownVisible && task.sub_tasks && task.sub_tasks.length > 0 && (
                        <div
                        className="absolute top-full -left-3 w-78 sm:w-64 bg-white shadow-lg z-10 rounded-md"
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                        }}
                        >
                        <ul className="py-1 max-h-75 overflow-y-auto">
                            {task.sub_tasks.map(subtask => (
                            <li key={subtask.id} className="flex justify-between items-center px-4 py-2 text-sm text-gray-700 truncate">
                                <span className="truncate">{subtask.title}</span>
                                {/* 2. subtask.statusがtrueの場合に緑色のチェックマークを表示 */}
                                {subtask.status && (
                                    <FaCheck className="text-cyan-700 ml-2 flex-shrink-0" />
                                )}
                            </li>
                            ))}
                        </ul>
                        </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    </div>
  );
};

export default TaskCard;