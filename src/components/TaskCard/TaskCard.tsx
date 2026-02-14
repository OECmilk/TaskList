'use client';

import { useState } from "react";
import TaskDeleteButton from "../Button/TaskDeleteButton";
import TaskCompleteButton from "../Button/TaskCompleteButton";
import ProgressBar from "./ProgressBar/ProgressBar";
import { Task } from "@/types";
import Link from "next/link";
import { FaCheck } from "react-icons/fa";
import { FaRegClock } from "react-icons/fa6";

const TaskCard = ({ task }: { task: Task }) => {
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);

    // タスクの進捗を計算
    const totalSubTasks = task.sub_tasks ? task.sub_tasks.length : 0;
    const completedSubTasks = task.sub_tasks ? task.sub_tasks.filter(subtask => subtask.status).length : 0;

    const today = new Date().toISOString().split('T')[0];
    const isOverdue = task.due_date < today && task.status !== '完了';


    return (
        <div className="relative mt-4">

            {/* プロジェクトが存在する場合にのみ、タブを絶対配置で表示 */}
            {task.project_id && (
                <div
                    className="absolute top-0 left-0 w-1/2 -translate-y-full px-3 py-1 rounded-t-lg text-xs font-bold text-center truncate z-1"
                    style={{
                        background: 'var(--color-surface-elevated)',
                        color: 'var(--color-text-secondary)',
                        border: '1px solid var(--color-border)',
                        borderBottom: 'none',
                    }}
                >
                    {task.projects?.name}
                </div>
            )}

            <Link
                href={`/detail/${task.id}?retunPath=/`}
                prefetch={true}
                className="card w-80 h-60 sm:w-64 sm:h-54 p-4 flex flex-col justify-between"
            >
                <header>
                    <div className="flex justify-between" onClick={(e) => e.stopPropagation()}>
                        <ProgressBar total={totalSubTasks} completed={completedSubTasks} status={task.status} />
                        <TaskCompleteButton id={task.id} status={task.status} size="lg" />
                    </div>
                    <h1 className="text-lg font-bold truncate mt-1" style={{ color: 'var(--color-text-primary)' }}>
                        {task.title}
                    </h1>
                    <div className="mt-1 text-sm line-clamp-3" style={{ color: 'var(--color-text-secondary)' }}>
                        {task.description}
                    </div>
                </header>
                <div>
                    <div className="flex justify-between items-end">
                        <div className="text-sm flex items-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
                            {task.due_date}

                            {/* タスクの期限がきれている場合、時計マークを表示 */}
                            {isOverdue && (
                                <span className="text-red-400" title="期限切れ">
                                    <FaRegClock className="size-3.5" />
                                </span>
                            )}
                        </div>
                        <div className="" onClick={(e) => e.stopPropagation()}>
                            <TaskDeleteButton id={task.id} />
                        </div>
                    </div>
                    <hr className="my-1" style={{ borderColor: 'var(--color-border)' }} />
                    <div
                        className="items-center"
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                        }}>
                        <div
                            className="relative"
                            onMouseEnter={() => setIsDropdownVisible(true)}
                            onMouseLeave={() => setIsDropdownVisible(false)}
                        >
                            <div className="mt-1 text-sm w-full text-center font-bold" style={{ color: 'var(--color-text-secondary)' }}>
                                SubTasks
                            </div>

                            {/* 4. isDropdownVisibleがtrue、かつサブタスクが存在する場合にプルダウンメニューを表示 */}
                            {isDropdownVisible && task.sub_tasks && task.sub_tasks.length > 0 && (
                                <div
                                    className="absolute top-full -left-4 w-78 sm:w-64 card z-10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                    }}
                                >
                                    <ul className="py-1 max-h-75 overflow-y-auto">
                                        {task.sub_tasks.map(subtask => (
                                            <li key={subtask.id} className="flex justify-between items-center px-4 py-2 text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
                                                <span className="truncate">{subtask.title}</span>
                                                {subtask.status && (
                                                    <FaCheck className="ml-2 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
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