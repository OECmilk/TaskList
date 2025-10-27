'use client';

import { GanttTask } from '@/app/(main)/gantt/page';
import { useMemo, useState, useEffect, useRef, useCallback, startTransition } from 'react';
import { updateTaskDates, updateTaskUser } from '@/app/actions'; // Server Actionをインポート

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DAY_WIDTH = 50; // 1日の幅 (px)

type DraggingState = {
  taskId: number;
  handle: 'start' | 'end';
  initialX: number;
  originalTask: GanttTask;
} | null;

const GanttChart = ({ tasks }: { tasks: GanttTask[] }) => {
    // UIの即時反映のために、タスクをローカルのstateで管理
    const [localTasks, setLocalTasks] = useState(tasks);
    const [dragging, setDragging] = useState<DraggingState>(null);
    const ganttRef = useRef<HTMLDivElement>(null);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    // propsのtasksが変更されたらローカルstateを同期
    useEffect(() => {
        setLocalTasks(tasks);
    }, [tasks]);

    // タイムラインの計算
    const { timelineStart, totalDays } = useMemo(() => {
        if (localTasks.length === 0) {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            return { timelineStart: today, totalDays: 1 };
        }
        const today = new Date();
        const endDates = localTasks.map(t => new Date(t.end));
        const minDate = new Date(today);
        const maxDate = new Date(Math.max(...endDates.map(d => d.getTime())));
        minDate.setDate(minDate.getDate() - 4);
        maxDate.setDate(maxDate.getDate() + 25);
        const diffInMs = maxDate.getTime() - minDate.getTime();
        const days = Math.round(diffInMs / DAY_IN_MS);
        return { timelineStart: minDate, totalDays: days };
    }, [localTasks]);

    // 日付ヘッダーの生成
    const dateHeaders = useMemo(() => {
        const headers = [];
        const currentDate = new Date(timelineStart);
        for (let i = 0; i <= totalDays; i++) {
            headers.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return headers;
    }, [timelineStart, totalDays]);

    // ドラッグ開始
    const handleMouseDown = (e: React.MouseEvent, taskId: number, handle: 'start' | 'end') => {
        e.stopPropagation();
        const originalTask = localTasks.find(t => t.id === taskId);
        if (originalTask) {
            setDragging({ taskId, handle, initialX: e.clientX, originalTask });
        }
    };

    // ドラッグ中のマウス移動
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!dragging) return;
        const deltaX = e.clientX - dragging.initialX;
        const deltaDays = Math.round(deltaX / DAY_WIDTH);

        setLocalTasks(prevTasks =>
            prevTasks.map(task => {
                if (task.id === dragging.taskId) {
                    const originalStart = new Date(dragging.originalTask.start);
                    const originalEnd = new Date(dragging.originalTask.end);
                    if (dragging.handle === 'start') {
                        const newStart = new Date(originalStart);
                        newStart.setDate(originalStart.getDate() + deltaDays);
                        if (newStart > originalEnd) return task;
                        return { ...task, start: newStart.toISOString().split('T')[0] };
                    } else {
                        const newEnd = new Date(originalEnd);
                        newEnd.setDate(originalEnd.getDate() + deltaDays);
                        if (newEnd < originalStart) return task;
                        return { ...task, end: newEnd.toISOString().split('T')[0] };
                    }
                }
                return task;
            })
        );
    }, [dragging]);

    // ドラッグ終了
    const handleMouseUp = useCallback(async () => {
        if (!dragging) return;

        // 既存のタイマーがあればキャンセル
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // 1.5秒後にデータベースを更新するタイマーをセット
        debounceTimer.current = setTimeout(async () => {
            const updatedTask = localTasks.find(t => t.id === dragging!.taskId);
            if (updatedTask) {
                try {
                    await updateTaskDates(updatedTask.id, updatedTask.start, updatedTask.end);
                } catch (error) {
                    console.error("Failed to update task dates", error);
                    // エラー時はUIを元のpropsの状態に戻す
                    setLocalTasks(tasks);
                }
            }
        }, 1500); // 1500ミリ秒 = 1.5秒

        setDragging(null);
    }, [dragging, localTasks, tasks]);
    
    // ドラッグ操作のためのグローバルなイベントリスナーを設定
    useEffect(() => {
        if (dragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragging, handleMouseMove, handleMouseUp]);

    const todayString = new Date().toISOString().split('T')[0];

    // タスクの担当者変更のイベントハンドラ
    const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>, taskId: number) => {
        const newUserId = event.target.value;

        // 既存のDB更新大麻ーがあればキャンセル
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // 1.5秒後にDBを更新するタイマーをセット
        debounceTimer.current = setTimeout(() => {
            startTransition(async () => {
                try {
                    await updateTaskUser(taskId, newUserId);
                } catch (error) {
                    console.error("Failed to update task user", error);
                    setLocalTasks(tasks); // エラー時はUIを元のpropsの状態に戻す
                }
            });
        }, 500); // 500ミリ秒
    };


    return (
        <div ref={ganttRef} className="overflow-x-auto select-none flex">
            {/* タスク担当者用プルダウン */}
            <div className="rounded-lg mr-2 mt-15">
                {tasks.map((task) =>
                <select
                    key={task.id}
                    value={task.user_id}
                    onChange={(e) => handleUserChange(e, task.id)}
                    className='text-sm border h-8 w-28 text-center truncate p-1 rounded-lg justify-center mb-4 flex bg-gray-100'>
                    {task.project && task.project_members?.map(member => (
                        <option key={member.user_id} value={member.user_id}>
                            {member.user_name}
                        </option>
                    ))}
                </select>
                )}
            </div>

            <div style={{ minWidth: `${(totalDays + 1) * DAY_WIDTH}px` }}>
                <div className="grid sticky top-0 bg-white z-10" style={{ gridTemplateColumns: `repeat(${totalDays + 1}, ${DAY_WIDTH}px)` }}>
                    {dateHeaders.map((date, i) => {
                        const dayOfWeek = date.getDay(); // 0:日曜, 1:月曜, ..., 6:土曜
                        const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
                        const dayText = `(${weekdays[dayOfWeek]})`;
                        const dateText = `${date.getMonth() + 1}/${date.getDate()}`;

                        let dayColorClass = 'text-gray-500';
                        if (dayOfWeek === 0) { // 日曜日
                            dayColorClass = 'text-red-500 font-semibold';
                        } else if (dayOfWeek === 6) { // 土曜日
                            dayColorClass = 'text-blue-500 font-semibold';
                        }

                        // 今日の日付かどうかを判定
                        const isToday = date.toISOString().split('T')[0] === todayString;
                        const dateBgClass = isToday ? 'font-bold bg-cyan-100' : '';

                        return (
                            <div key={i} className={`text-xs text-center border-r border-b border-gray-300 py-2 space-y-1 ${dateBgClass}`}>
                                <div>{dateText}</div>
                                <div className={dayColorClass}>{dayText}</div>
                            </div>
                        );
                    })}
                </div>
                <div className="relative">
                    {/*グリッド*/}
                    <div 
                        className="absolute inset-0 z-0 grid" 
                        style={{ gridTemplateColumns: `repeat(${totalDays + 1}, ${DAY_WIDTH}px)` }}
                    >
                        {dateHeaders.map((date, i) => {
                            const isToday = date.toISOString().split('T')[0] === todayString;
                            const dateBgClass = isToday ? 'bg-cyan-100' : '';
                            return (
                                <div
                                    key={i}
                                    className={`h-full border-r border-gray-300 ${dateBgClass}`}
                                />
                            );
                        })}
                    </div>

                    {localTasks.map((task) => {
                        const taskStart = new Date(task.start);
                        const taskEnd = new Date(task.end);
                        const startOffsetDays = Math.max(0, Math.round((taskStart.getTime() - timelineStart.getTime()) / DAY_IN_MS));
                        const durationDays = Math.max(1, Math.round((taskEnd.getTime() - taskStart.getTime()) / DAY_IN_MS) + 1);
                        const left = startOffsetDays * DAY_WIDTH;
                        const width = durationDays * DAY_WIDTH - 4;

                        return (
                            <div key={task.id} className="h-12 flex items-center border-b border-gray-100 relative">
                                {/* <div className="rounded-lg bg-gray-100">
                                    <select
                                        value={task.user_id}
                                        onChange={(e) => handleUserChange(e, task.id)}
                                        className='text-sm border w-30 text-center truncate p-1 rounded-lg p-1'>
                                        {task.project && task.project_members?.map(member => (
                                            <option key={member.user_id} value={member.user_id}>
                                                {member.user_name}
                                            </option>
                                        ))}
                                    </select>
                                </div> */}
                                <div
                                    title={`${task.title} (${task.start} ~ ${task.end})`}
                                    className="absolute h-8 bg-cyan-600/60 rounded-md flex items-center px-2 font-bold text-sm group transition-all duration-200"
                                    style={{ left: `${left}px`, width: `${width}px`, top: '8px' }}
                                >
                                    <p className="whitespace-nowrap">{task.project ? `[${task.project}] ` : ''}{task.title}</p>

                                    {/* ドラッグハンドル */}
                                    <div 
                                        onMouseDown={(e) => handleMouseDown(e, task.id, 'start')}
                                        className="absolute left-0 top-0 h-full w-4 cursor-ew-resize opacity-0 group-hover:opacity-100 bg-black/10 rounded-l-md"
                                    />
                                    <div 
                                        onMouseDown={(e) => handleMouseDown(e, task.id, 'end')}
                                        className="absolute right-0 top-0 h-full w-4 cursor-ew-resize opacity-0 group-hover:opacity-100 bg-black/10 rounded-r-md"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default GanttChart;

