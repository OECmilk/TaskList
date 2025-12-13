'use client';

import { GanttTask } from '@/app/(main)/gantt/page';
import { useMemo, useState, useEffect, useRef, useCallback, startTransition } from 'react';
import { updateTaskDates } from '@/app/actions';
import Link from 'next/link';
import Image from 'next/image';

const MIN_ROW_HEIGHT = 40; // 1日の最小高さ (px) - 2週間(14日) * 40 = 560px (スマホ1画面に収まる)

type MobileDraggingState = {
    taskId: number;
    handle: 'start' | 'end' | 'move';
    initialY: number;
    originalTask: GanttTask;
    initialStart: Date;
    initialEnd: Date;
} | null;

const MobileGanttChart = ({ tasks, baseDate }: { tasks: GanttTask[], baseDate: Date }) => {
    const [localTasks, setLocalTasks] = useState(tasks);
    const [dragging, setDragging] = useState<MobileDraggingState>(null);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    // propsのtasksが変更されたらローカルstateを同期
    useEffect(() => {
        setLocalTasks(tasks);
    }, [tasks]);

    // タイムラインの計算 (今日から前後)
    const { timelineStart, totalDays } = useMemo(() => {
        // デフォルト: 今日 - 2日, 今日 + 20日
        const today = new Date(baseDate);
        today.setHours(0, 0, 0, 0); // Normalize to midnight

        const minDate = new Date(today);
        minDate.setDate(today.getDate() - 2); // Start 2 days before today

        const maxDate = new Date(today);
        maxDate.setDate(today.getDate() + 25);

        // タスクがある場合、終了日（下方向）は拡張してもよいが、開始日（上方向）は固定する
        if (localTasks.length > 0) {
            const endDates = localTasks.map(t => new Date(t.end));
            const maxTask = new Date(Math.max(...endDates.map(d => d.getTime())));

            // Extend end date if tasks go beyond
            if (maxTask > maxDate) maxDate.setTime(maxTask.getTime() + (5 * 24 * 60 * 60 * 1000));
        }

        // 時間部分をリセット
        minDate.setHours(0, 0, 0, 0);
        maxDate.setHours(0, 0, 0, 0);

        const diffInMs = maxDate.getTime() - minDate.getTime();
        const days = Math.round(diffInMs / (24 * 60 * 60 * 1000));
        return { timelineStart: minDate, totalDays: days };
    }, [localTasks, baseDate]);

    // 日付ヘッダーと月のグルーピング
    const { daterows, monthRows } = useMemo(() => {
        const rows = [];
        const months = [];
        const currentDate = new Date(timelineStart);

        let currentMonthLabel = '';
        let currentMonthStart = 0;
        let currentMonthLength = 0;

        for (let i = 0; i <= totalDays; i++) {
            const d = new Date(currentDate);
            rows.push(d);

            // Month Grouping
            const monthLabel = `${d.getFullYear()}.${d.getMonth() + 1}`;
            if (monthLabel !== currentMonthLabel) {
                if (currentMonthLabel !== '') {
                    months.push({ label: currentMonthLabel, start: currentMonthStart, length: currentMonthLength });
                }
                currentMonthLabel = monthLabel;
                currentMonthStart = i;
                currentMonthLength = 1;
            } else {
                currentMonthLength++;
            }
            if (i === totalDays) {
                months.push({ label: currentMonthLabel, start: currentMonthStart, length: currentMonthLength });
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }
        return { daterows: rows, monthRows: months };
    }, [timelineStart, totalDays]);

    // タスクのレイアウト計算 (重なり処理)
    const { layoutTasks, maxTracks } = useMemo(() => {
        // 開始日順にソート
        const sorted = [...localTasks].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
        const tracks: Date[] = []; // 各トラックの「最後のタスクの終了日」を保持
        const taskWithTracks = sorted.map(task => {
            const taskStart = new Date(task.start);
            const taskEnd = new Date(task.end);

            // 入れるトラックを探す
            let trackIndex = tracks.findIndex(trackEnd => trackEnd < taskStart);

            if (trackIndex === -1) {
                // 新しいトラックを作成
                trackIndex = tracks.length;
                tracks.push(taskEnd);
            } else {
                // 既存のトラックを更新
                tracks[trackIndex] = taskEnd;
            }

            return { ...task, trackIndex };
        });

        return { layoutTasks: taskWithTracks, maxTracks: tracks.length };
    }, [localTasks]);

    // ドラッグ処理
    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent, taskId: number, handle: 'start' | 'end' | 'move') => {
        e.stopPropagation();
        // Prevent scroll on touch
        // if (e.type === 'touchstart') e.preventDefault(); 

        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const originalTask = localTasks.find(t => t.id === taskId);
        if (originalTask) {
            setDragging({
                taskId,
                handle,
                initialY: clientY,
                originalTask,
                initialStart: new Date(originalTask.start),
                initialEnd: new Date(originalTask.end)
            });
        }
    };

    const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!dragging) return;

        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const deltaY = clientY - dragging.initialY;
        const deltaDays = Math.round(deltaY / MIN_ROW_HEIGHT);

        setLocalTasks(prevTasks => prevTasks.map(task => {
            if (task.id === dragging.taskId) {
                const newStart = new Date(dragging.initialStart);
                const newEnd = new Date(dragging.initialEnd);

                if (dragging.handle === 'move') {
                    newStart.setDate(newStart.getDate() + deltaDays);
                    newEnd.setDate(newEnd.getDate() + deltaDays);
                } else if (dragging.handle === 'start') {
                    newStart.setDate(newStart.getDate() + deltaDays);
                    if (newStart > newEnd) return task; // 整合性チェック
                } else if (dragging.handle === 'end') {
                    newEnd.setDate(newEnd.getDate() + deltaDays);
                    if (newEnd < newStart) return task; // 整合性チェック
                }

                return {
                    ...task,
                    start: newStart.toISOString().split('T')[0],
                    end: newEnd.toISOString().split('T')[0]
                };
            }
            return task;
        }));
    }, [dragging]);

    const handleMouseUp = useCallback(() => {
        if (!dragging) return;

        // DB更新遅延実行
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(async () => {
            const updatedTask = localTasks.find(t => t.id === dragging!.taskId);
            if (updatedTask) {
                try {
                    await updateTaskDates(updatedTask.id, updatedTask.start, updatedTask.end);
                } catch (error) {
                    console.error("Failed to update task dates", error);
                    setLocalTasks(tasks); // Revert
                }
            }
        }, 1000);

        setDragging(null);
    }, [dragging, localTasks, tasks]);

    useEffect(() => {
        if (dragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleMouseMove, { passive: false });
            window.addEventListener('touchend', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleMouseMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [dragging, handleMouseMove, handleMouseUp]);


    const TRACK_WIDTH = 40; // 1トラックの幅 (px) - 画面幅が400pxなら10トラック表示

    // ... inside component ...

    // Right side container needs to handle horizontal scroll
    // Grid lines should span the full scrollable width
    const gridWidth = Math.max(maxTracks * TRACK_WIDTH, 100);

    return (
        <div className="relative w-full overflow-hidden flex select-none bg-white h-full">
            {/* Left: Date Axis - Fixed 2-Tier */}
            <div className="flex-shrink-0 border-r border-gray-200 bg-gray-50 z-20 shadow-sm h-full overflow-hidden relative flex flex-row" style={{ width: '80px' }}> {/* Width 80px for 2 cols */}

                {/* Month Column */}
                <div className="w-[30px] flex-shrink-0 border-r border-gray-200 bg-white">
                    {monthRows.map((month, i) => (
                        <div
                            key={i}
                            style={{ height: `${month.length * MIN_ROW_HEIGHT}px` }}
                            className="flex items-center justify-center text-[10px] font-bold text-gray-500 select-none overflow-hidden"
                        >
                            <span
                                className="[writing-mode:vertical-rl] leading-none"
                                translate="no"
                            >
                                {month.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Day Column */}
                <div className="flex-1 w-[50px]">
                    {daterows.map((date, i) => {
                        const isToday = date.toDateString() === new Date(baseDate).toDateString();
                        const dayLabels = ['日', '月', '火', '水', '木', '金', '土'];
                        const dayColor = date.getDay() === 0 ? 'text-red-500' : date.getDay() === 6 ? 'text-blue-500' : 'text-gray-500';

                        return (
                            <div
                                key={i}
                                style={{ height: `${MIN_ROW_HEIGHT}px` }}
                                className={`flex flex-col items-center justify-center border-b border-gray-100 ${isToday ? 'bg-blue-100 font-bold' : ''}`}
                                translate="no"
                            >
                                <span className="text-gray-700 font-medium">{date.getDate()}</span>
                                <span className={`${dayColor} text-[10px]`}>{dayLabels[date.getDay()]}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right: Task Grid - Scrollable X */}
            <div className="flex-1 overflow-x-auto overflow-y-visible">
                <div className="relative" style={{ height: `${(totalDays + 1) * MIN_ROW_HEIGHT}px`, width: `${Math.max(gridWidth, 300)}px` }}>
                    {/* Background Grid Lines */}
                    {daterows.map((date, i) => {
                        const isToday = date.toDateString() === new Date().toDateString();
                        return (
                            <div
                                key={`grid-${i}`}
                                style={{ top: `${i * MIN_ROW_HEIGHT}px`, height: `${MIN_ROW_HEIGHT}px` }}
                                className={`absolute w-full border-b border-gray-50 ${isToday ? 'bg-blue-50/30' : ''}`}
                            />
                        );
                    })}

                    {/* Tasks */}
                    {layoutTasks.map((task) => {
                        const startDate = new Date(task.start);
                        const endDate = new Date(task.end);

                        // Original layout values
                        let startOffsetDays = Math.round((startDate.getTime() - timelineStart.getTime()) / (24 * 60 * 60 * 1000));
                        let durationDays = Math.round((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;

                        // Clamping logic: if task starts before timeline, cut off the top
                        if (startOffsetDays < 0) {
                            durationDays += startOffsetDays; // Subtract the days that are off-screen (since startOffsetDays is negative)
                            startOffsetDays = 0; // Clamp top to 0
                        }

                        // Ensure minimum height for visibility if partially visible, or hide if fully out (though durationDays <= 0 would hide it effectively)
                        // Actually if durationDays <= 0, it means the task ended before the timeline starts.
                        if (durationDays <= 0) {
                            // Render a small slice at the top to indicate "past task"? Or just hide?
                            // Desktop version renders a small "0.4 * WIDTH" slice.
                            // Let's render a small slice at top 0 with small height.
                            durationDays = 0.5;
                            startOffsetDays = 0;
                        }


                        const top = startOffsetDays * MIN_ROW_HEIGHT;
                        const height = durationDays * MIN_ROW_HEIGHT;

                        // Fixed Width Positioning
                        const left = task.trackIndex * TRACK_WIDTH;

                        return (
                            <div
                                key={task.id}
                                style={{
                                    top: `${top}px`,
                                    height: `${height - 4}px`, // 4px gap
                                    left: `${left}px`,
                                    width: `${TRACK_WIDTH - 2}px`, // 2px gap between tracks
                                    position: 'absolute',
                                    marginTop: '2px'
                                }}
                                className="rounded-md bg-cyan-100 border-l-4 border-cyan-500 shadow-sm flex flex-col justify-center px-1 text-xs overflow-hidden group hover:z-20 hover:shadow-md transition-shadow"
                                onMouseDown={(e) => handleMouseDown(e, task.id, 'move')}
                                onTouchStart={(e) => handleMouseDown(e, task.id, 'move')}
                            >
                                {/* Drag Handles */}
                                <div
                                    className="absolute top-0 left-0 w-full h-3 cursor-ns-resize opacity-0 group-hover:opacity-50 hover:bg-black/10 z-10"
                                    onMouseDown={(e) => handleMouseDown(e, task.id, 'start')}
                                    onTouchStart={(e) => handleMouseDown(e, task.id, 'start')}
                                />

                                <Link
                                    href={`/detail/${task.id}?returnPath=/gantt`}
                                    className="block w-full h-full relative"
                                    onClick={(e) => e.stopPropagation()} // Stop propagation to prevent drag start on simple click? No, we want drag possible. But if we drag, click is canceled. If we click, we want nav.
                                // Actually, if we stop propagation of Click, it doesn't affect Drag (mousedown).
                                // But if we stop propagation of Mousedown, Drag won't start.
                                // We want Drag to start on Mousedown.
                                // So do NOT stop propagation of mousedown/touchstart.
                                // But what about onClick? We want navigation.
                                >
                                    <div className="font-bold text-cyan-900 leading-tight select-none [writing-mode:vertical-rl] block w-full h-full align-middle pt-2">
                                        {task.title}
                                    </div>
                                    {task.user_icon && (
                                        <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full overflow-hidden bg-white/50">
                                            <Image src={task.user_icon} alt="user" fill className="object-cover" />
                                        </div>
                                    )}
                                </Link>

                                <div
                                    className="absolute bottom-0 left-0 w-full h-3 cursor-ns-resize opacity-0 group-hover:opacity-50 hover:bg-black/10 z-10"
                                    onMouseDown={(e) => handleMouseDown(e, task.id, 'end')}
                                    onTouchStart={(e) => handleMouseDown(e, task.id, 'end')}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MobileGanttChart;
