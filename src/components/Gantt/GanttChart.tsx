'use client';

import { GanttTask } from '@/app/(main)/gantt/page';
import { TaskStatus } from '@/types';
import { useMemo, useState, useEffect, useRef, useCallback, startTransition } from 'react';
import { updateTaskDates, updateTaskUser, setTaskStatus } from '@/app/actions';
import Link from 'next/link';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { FaClock } from 'react-icons/fa';

const STATUS_COLORS: Record<TaskStatus, string> = {
    '未着手': 'rgb(255, 143, 143)',
    '処理中': 'rgb(170, 215, 217)',
    '保留': 'rgb(167, 146, 119)',
    '完了': 'rgb(163, 220, 154)',
};

const StatusSelector = ({ task, onChange }: { task: GanttTask, onChange: (status: TaskStatus) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState<{ top?: number, bottom?: number, left: number, width: number } | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const toggleDropdown = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;
            const dropdownHeight = 160;
            const spaceBelow = viewportHeight - rect.bottom;
            const dropdownWidth = 140;

            let left = rect.left;
            if (left + dropdownWidth > viewportWidth) left = viewportWidth - dropdownWidth - 10;
            if (left < 10) left = 10;

            setDropdownPosition({
                ...(spaceBelow < dropdownHeight
                    ? { bottom: viewportHeight - rect.top + 4 }
                    : { top: rect.bottom + 4 }),
                left,
                width: dropdownWidth
            });
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        if (!isOpen) return;
        const handleScroll = () => setIsOpen(false);
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleScroll);
        };
    }, [isOpen]);

    return (
        <div className="relative mb-4">
            <button
                ref={buttonRef}
                onClick={toggleDropdown}
                className={`h-8 flex items-center justify-center gap-2 px-2 rounded-lg border shadow-sm transition-colors w-16 md:w-[90px] bg-white hover:bg-gray-50 hover:opacity-70 cursor-pointer ${isOpen ? 'ring-2 ring-blue-500' : ''}`}
                style={{ borderColor: 'var(--color-border)' }}
            >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[task.status] }}></span>
                <span
                    className="text-xs font-bold truncate flex-1 text-left"
                    style={{ color: '#4b5563' }}
                >
                    {task.status}
                </span>
                <span className="text-gray-400 text-[10px] ml-auto hidden md:block">▼</span>
            </button>
            {isOpen && dropdownPosition && createPortal(
                <>
                    <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)} />
                    <div
                        className="fixed z-[9999] rounded-lg shadow-xl border bg-white py-1 overflow-hidden"
                        style={{
                            left: dropdownPosition.left,
                            width: 100,
                            ...(dropdownPosition.top ? { top: dropdownPosition.top } : {}),
                            ...(dropdownPosition.bottom ? { bottom: dropdownPosition.bottom } : {}),
                        }}
                    >
                        {(Object.keys(STATUS_COLORS) as TaskStatus[]).map((status) => (
                            <button
                                key={status}
                                onClick={() => { onChange(status); setIsOpen(false); }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 hover:opacity-70 cursor-pointer text-left"
                            >
                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[status] }}></span>
                                <span className="text-xs truncate">{status}</span>
                            </button>
                        ))}
                    </div>
                </>,
                document.body
            )}
        </div>
    );
};

const UserSelector = ({ task, onChange }: { task: GanttTask, onChange: (id: string, name: string, icon: string | null) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState<{ top?: number, bottom?: number, left: number, width: number } | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const toggleDropdown = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;
            const dropdownHeight = 200;
            const spaceBelow = viewportHeight - rect.bottom;

            const dropdownWidth = 220;

            let left = rect.left;
            if (left + dropdownWidth > viewportWidth) {
                left = viewportWidth - dropdownWidth - 10;
            }
            if (left < 0) left = 10;

            if (spaceBelow < dropdownHeight) {
                setDropdownPosition({
                    bottom: viewportHeight - rect.top + 4,
                    left: left,
                    width: dropdownWidth
                });
            } else {
                setDropdownPosition({
                    top: rect.bottom + 4,
                    left: left,
                    width: dropdownWidth
                });
            }
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        if (!isOpen) return;
        const handleScrollOrResize = () => setIsOpen(false);
        window.addEventListener('scroll', handleScrollOrResize, true);
        window.addEventListener('resize', handleScrollOrResize);
        return () => {
            window.removeEventListener('scroll', handleScrollOrResize, true);
            window.removeEventListener('resize', handleScrollOrResize);
        }
    }, [isOpen]);


    if (!task.project || !task.project_members) {
        return (
            <div className="h-8 mb-4 flex items-center gap-2 px-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-500 w-auto md:min-w-[140px]">
                <div className="relative w-5 h-5 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    <Image
                        src={task.user_icon || '/default_icon.svg'}
                        alt={task.user_name}
                        fill
                        className="object-cover"
                    />
                </div>
                <span className="text-sm truncate max-w-[90px] hidden md:block">{task.user_name}</span>
            </div>
        );
    }


    return (
        <div className="relative mb-4">
            <button
                ref={buttonRef}
                onClick={toggleDropdown}
                className={`h-8 flex items-center gap-2 px-2 rounded-lg border shadow-sm transition-colors w-auto md:min-w-[140px] text-left hover:opacity-70 cursor-pointer ${isOpen ? 'ring-2' : ''}`}
                style={{
                    background: isOpen ? 'var(--color-surface)' : 'var(--color-bg)',
                    borderColor: isOpen ? 'var(--color-accent)' : 'var(--color-border)',
                    boxShadow: isOpen ? '0 0 0 2px var(--color-accent-alpha)' : 'none'
                }}
            >
                <div className="relative w-5 h-5 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    <Image
                        src={task.user_icon || '/default_icon.svg'}
                        alt={task.user_name}
                        fill
                        className="object-cover"
                    />
                </div>
                <span className="text-sm text-gray-700 truncate max-w-[80px] flex-1 hidden md:block">{task.user_name}</span>
                <span className="text-gray-400 text-xs ml-auto hidden md:block">▼</span>
            </button>

            {isOpen && dropdownPosition && createPortal(
                <>
                    <div
                        className="fixed inset-0 z-[9998] bg-transparent"
                        onClick={() => setIsOpen(false)}
                    />

                    <div
                        className="drawer-ignore-click fixed z-[9999] rounded-lg shadow-xl border py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                        style={{
                            background: 'var(--color-card)',
                            borderColor: 'var(--color-border)',
                            left: dropdownPosition.left,
                            width: dropdownPosition.width,
                            ...(dropdownPosition.top ? { top: dropdownPosition.top } : {}),
                            ...(dropdownPosition.bottom ? { bottom: dropdownPosition.bottom } : {}),
                            maxHeight: '200px',
                            overflowY: 'auto'
                        }}
                    >
                        {task.project_members.map((member) => (
                            <button
                                key={member.user_id}
                                onClick={() => {
                                    onChange(member.user_id, member.user_name, member.user_icon);
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 transition-colors text-left hover:bg-gray-50 hover:opacity-70 cursor-pointer"
                                style={{
                                    background: task.user_id === member.user_id ? 'var(--color-accent-alpha)' : 'transparent',
                                    color: task.user_id === member.user_id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
                                }}
                            >
                                <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                    <Image
                                        src={member.user_icon || '/default_icon.svg'}
                                        alt={member.user_name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <span className="text-sm truncate">{member.user_name}</span>
                                {task.user_id === member.user_id && (
                                    <span className="ml-auto text-xs" style={{ color: 'var(--color-accent)' }}>✓</span>
                                )}
                            </button>
                        ))}
                    </div>
                </>,
                document.body
            )}
        </div>
    );
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DAY_WIDTH = 30; // 1日の幅 (px) - Compact

type DraggingState = {
    taskId: number;
    handle: 'start' | 'end';
    initialX: number;
    originalTask: GanttTask;
    isClamped: boolean; // 視覚的に左端に固定されているかどうか
} | null;

const GanttChart = ({ tasks, baseDate }: { tasks: GanttTask[], baseDate: Date }) => {
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
        const today = new Date(baseDate);
        today.setHours(0, 0, 0, 0);

        // デフォルトの表示範囲（今日-4日 〜 今日+60日）
        // これにより、タスクがない場合や日付が極端な場合でも最低限の期間を確保する
        const defaultMin = new Date(today);
        defaultMin.setDate(defaultMin.getDate() - 4);

        const defaultMax = new Date(today);
        defaultMax.setDate(defaultMax.getDate() + 60);

        const minDate = new Date(defaultMin);
        let maxDate = new Date(defaultMax);

        if (localTasks.length > 0) {
            // タスクがある場合、タスクの期間も考慮して範囲を広げる
            const startDates = localTasks.map(t => new Date(t.start));
            const endDates = localTasks.map(t => new Date(t.end));

            const minTaskStart = new Date(Math.min(...startDates.map(d => d.getTime())));
            const maxTaskEnd = new Date(Math.max(...endDates.map(d => d.getTime())));

            // 開始日: 過去のタスクがあっても、タイムラインは「今日-4日」から開始する（ユーザー要望）
            // そのため、这里的 minDate 拡張ロジックは削除します。

            /* 
            if (minTaskStart < minDate) {
                minDate = new Date(minTaskStart);
                minDate.setDate(minDate.getDate() - 4);
            }
            */

            // 終了日: デフォルトより先のタスクがあればそこまで広げる（さらに25日余裕を持たせる）
            const potentialMax = new Date(maxTaskEnd);
            potentialMax.setDate(potentialMax.getDate() + 25);

            if (potentialMax > maxDate) {
                maxDate = potentialMax;
            }
        }

        const diffInMs = maxDate.getTime() - minDate.getTime();
        const days = Math.round(diffInMs / DAY_IN_MS);

        return { timelineStart: minDate, totalDays: days };
    }, [localTasks, baseDate]);

    // 日付ヘッダーの生成
    // 日付ヘッダーの生成 (With Month Grouping)
    const { dateHeaders, monthHeaders } = useMemo(() => {
        const headers = [];
        const months = [];
        const currentDate = new Date(timelineStart);

        // Loop through all days to build headers and grouped months
        let currentMonthLabel = '';
        let currentMonthStart = 0;
        let currentMonthLength = 0;

        for (let i = 0; i <= totalDays; i++) {
            headers.push(new Date(currentDate));

            // Month Grouping Logic
            const monthLabel = `${currentDate.getFullYear()}.${currentDate.getMonth() + 1}`;
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
            // Push last month group at the end
            if (i === totalDays) {
                months.push({ label: currentMonthLabel, start: currentMonthStart, length: currentMonthLength });
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }
        return { dateHeaders: headers, monthHeaders: months };
    }, [timelineStart, totalDays]);

    // ドラッグ開始
    const handleMouseDown = (e: React.MouseEvent, taskId: number, handle: 'start' | 'end') => {
        e.stopPropagation();
        const originalTask = localTasks.find(t => t.id === taskId);
        if (originalTask) {
            const taskEnd = new Date(originalTask.end);
            const taskStart = new Date(originalTask.start);
            // タスク終了日がタイムライン開始日より前なら「end固定」状態
            // タスク開始日がタイムライン開始日より前なら「start固定」状態
            const isClamped = (handle === 'end' && taskEnd < timelineStart) ||
                (handle === 'start' && taskStart < timelineStart);
            setDragging({ taskId, handle, initialX: e.clientX, originalTask, isClamped });
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

                    if (dragging.handle === 'start') {
                        // start操作時
                        const originalEnd = new Date(dragging.originalTask.end);
                        let baseDate = originalStart;

                        // 固定状態からのドラッグなら、基準日を「タイムライン開始日」とする
                        if (dragging.isClamped) {
                            baseDate = new Date(timelineStart);
                        }

                        const newStart = new Date(baseDate);
                        newStart.setDate(baseDate.getDate() + deltaDays);

                        // start操作時はendは不変
                        if (newStart > originalEnd) return task;
                        return { ...task, start: newStart.toISOString().split('T')[0] };
                    } else {
                        // end操作時
                        const originalEnd = new Date(dragging.originalTask.end);
                        let baseDate = originalEnd;

                        // 固定状態からのドラッグなら、基準日を「タイムライン開始日の前日」とする
                        // これにより、ドラッグ開始位置(delta=0)が「過去」に相当し、
                        // 右に1つ(delta=1)動かすと「タイムライン開始日(今日)」になる
                        if (dragging.isClamped) {
                            baseDate = new Date(timelineStart);
                            baseDate.setDate(timelineStart.getDate() - 1);
                        }

                        const newEnd = new Date(baseDate);
                        newEnd.setDate(baseDate.getDate() + deltaDays);

                        if (newEnd < originalStart) return task;
                        return { ...task, end: newEnd.toISOString().split('T')[0] };
                    }
                }
                return task;
            })
        );
    }, [dragging, timelineStart]);

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

    const toLocalDateString = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const todayString = toLocalDateString(new Date(baseDate));

    // タスクの担当者変更のイベントハンドラ
    const handleUserChange = (newUserId: string, newUserName: string, newUserIcon: string | null, taskId: number) => {
        // 楽観的更新: UIを即座に変更
        setLocalTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId
                    ? { ...task, user_id: newUserId, user_name: newUserName, user_icon: newUserIcon }
                    : task
            )
        );

        // 既存のDB更新タイマーがあればキャンセル
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
        }, 1500); // 500ミリ秒
    };



    // Status change handler
    const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
        // Optimistic update
        setLocalTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

        try {
            await setTaskStatus(taskId, newStatus);
        } catch (error) {
            console.error("Failed to update status", error);
            setLocalTasks(tasks); // Revert on error
        }
    };

    return (
        <div ref={ganttRef} className="overflow-x-auto select-none flex">
            {/* タスク担当者用プルダウン */}
            <div className="drawer-ignore-click rounded-lg mr-2 mt-[69px] w-auto md:min-w-[140px]">
                {/* タスクがプロジェクトに所属している場合、担当者プルダウン */}
                {localTasks.map((task) => (
                    <UserSelector
                        key={task.id}
                        task={task}
                        onChange={(userId, userName, userIcon) => handleUserChange(userId, userName, userIcon, task.id)}
                    />
                ))}
            </div>

            {/* ステータス変更プルダウン */}
            <div className="drawer-ignore-click rounded-lg mr-2 mt-[69px] w-auto md:min-w-[80px]">
                {localTasks.map((task) => (
                    <StatusSelector
                        key={task.id}
                        task={task}
                        onChange={(status) => handleStatusChange(task.id, status)}
                    />
                ))}
            </div>

            <div style={{ minWidth: `${(totalDays + 1) * DAY_WIDTH}px` }}>
                {/* Two-Tier Sticky Header */}
                <div className="sticky top-0 bg-white z-10 border-b border-gray-300 shadow-sm">
                    {/* Month Row */}
                    <div className="relative h-7 border-b border-gray-100 flex">
                        {monthHeaders.map((month, i) => (
                            <div
                                key={i}
                                style={{ width: `${month.length * DAY_WIDTH}px` }}
                                className="flex items-center pl-2 text-xs font-bold text-gray-600 border-r border-gray-100 truncate"
                            >
                                {month.label}
                            </div>
                        ))}
                    </div>
                    {/* Day Row */}
                    <div className="grid" style={{ gridTemplateColumns: `repeat(${totalDays + 1}, ${DAY_WIDTH}px)` }}>
                        {dateHeaders.map((date, i) => {
                            const dayOfWeek = date.getDay();
                            const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
                            const dayText = weekdays[dayOfWeek];
                            const dateText = date.getDate();

                            let dayColorStyle = { color: 'var(--color-text-muted)' };
                            if (dayOfWeek === 0) dayColorStyle = { color: '#ef4444' };
                            else if (dayOfWeek === 6) dayColorStyle = { color: '#3b82f6' };

                            const isToday = toLocalDateString(date) === todayString;
                            const dateBgStyle = isToday ? { background: 'var(--color-accent-alpha)' } : {};

                            return (
                                <div
                                    key={i}
                                    className="text-[10px] text-center border-r py-1 flex flex-col justify-center items-center h-8"
                                    style={{
                                        ...dateBgStyle,
                                        borderColor: 'var(--color-border)'
                                    }}
                                    translate="no"
                                >
                                    <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{dateText}</div>
                                    <div className="text-[9px]" style={dayColorStyle}>{dayText}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="relative">
                    {/*グリッド*/}
                    <div
                        className="absolute inset-0 z-0 grid"
                        style={{ gridTemplateColumns: `repeat(${totalDays + 1}, ${DAY_WIDTH}px)` }}
                    >
                        {dateHeaders.map((date, i) => {
                            const isToday = toLocalDateString(date) === todayString;
                            const dateBgStyle = isToday ? { background: 'var(--color-accent-alpha)' } : {};
                            return (
                                <div
                                    key={i}
                                    className="h-full border-r"
                                    style={{
                                        ...dateBgStyle,
                                        borderColor: 'var(--color-border)'
                                    }}
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

                        // タスクバーの幅を決定
                        let width;
                        if (taskEnd < timelineStart) { // タスク終了日がタイムライン開始日より前
                            width = 0.4 * DAY_WIDTH;
                        } else if (taskStart < timelineStart) { // タスクの開始日が（今日 - 4日）より前の場合、タスクバーの幅を調整
                            const diffDaysOfStart = Math.round((timelineStart.getTime() - taskStart.getTime()) / DAY_IN_MS);
                            width = (durationDays - diffDaysOfStart) * DAY_WIDTH - 4;
                        } else {
                            width = durationDays * DAY_WIDTH - 4;
                        }

                        // 期限切れチェック: 期限が今日より前 かつ 未完了
                        const isOverdue = new Date(task.end) < new Date(todayString) && task.status !== '完了';

                        return (
                            <div key={task.id} className="h-12 flex items-center border-b border-gray-100 relative">

                                {/* タスクバー本体 */}
                                <div
                                    className="absolute h-8 rounded-md flex items-center px-2 font-bold text-sm group transition-all duration-200"
                                    style={{
                                        left: `${left}px`,
                                        width: `${width}px`,
                                        top: '8px',
                                        background: STATUS_COLORS[task.status],
                                        opacity: 0.9,
                                        color: '#1f2937', // Darker gray for better contrast
                                        textShadow: 'none',
                                        border: '1px solid rgba(0,0,0,0.1)'
                                    }}
                                >
                                    {/* Overdue Alert Icon */}
                                    {isOverdue && (
                                        <div className="absolute -top-2 -left-2 bg-white rounded-full p-0.5 shadow-sm z-20 border border-red-200">
                                            <FaClock className="text-red-500" size={12} />
                                        </div>
                                    )}
                                    <Link href={`/detail/${task.id}?returnPath=/gantt`}>
                                        <p className="whitespace-nowrap transition-colors duration-200 hover:text-gray-400 hover:opacity-80">{task.title}</p>
                                    </Link>

                                    {/* ドラッグハンドル */}
                                    {timelineStart <= taskEnd && (
                                        <div
                                            onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                                            onMouseDown={(e) => handleMouseDown(e, task.id, 'start')}
                                            className="absolute left-0 top-0 h-full w-4 cursor-ew-resize opacity-0 group-hover:opacity-100 bg-black/10 rounded-l-md"
                                        />
                                    )}
                                    <div
                                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
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

