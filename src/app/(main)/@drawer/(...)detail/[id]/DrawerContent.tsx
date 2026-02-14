'use client';

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaEdit, FaTrash } from "react-icons/fa";
import RouterBackButton from "@/components/Button/RouterBackButton";
import Chat, { ChatMessage } from "@/components/Chat/Chat";
import SubTasks from "@/components/Drawer/SubTasks";
import TaskCompleteButton from "@/components/Button/TaskCompleteButton";
import { Task } from "@/types";
import { deleteTask } from "@/app/actions";
import Image from "next/image";

type DrawerContentProps = {
    task: Task;
    initialMessages: ChatMessage[];
    returnPath: string;
};

const DrawerContent = ({ task, initialMessages, returnPath }: DrawerContentProps) => {
    const router = useRouter();
    const panelRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<'detail' | 'chat'>('detail');

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;

            // パネル内クリックは無視
            if (panelRef.current && panelRef.current.contains(target)) {
                return;
            }

            // 無視すべき要素（クラス名で指定）かどうかの判定
            if (target.closest('.drawer-ignore-click')) {
                return;
            }

            // それ以外（背景など）をクリックしたら戻る
            router.back();
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [router]);

    return (
        <div
            ref={panelRef}
            className="fixed top-0 right-0 w-full max-w-3xl h-full shadow-2xl z-40 overflow-y-auto animate-slideInFromRight"
            style={{ background: 'rgba(var(--theme-1), 0.97)', backdropFilter: 'blur(20px)', borderLeft: '1px solid var(--color-border)' }}
        >
            <div className="p-4 sm:p-8 md:p-12 pb-20 sm:pb-12 h-screen flex flex-col" style={{ color: 'var(--color-text-primary)' }}>

                {/* Header */}
                <header className="flex justify-between items-center mb-4 sm:mb-6 sticky top-0 -mx-4 -mt-4 sm:-mx-8 sm:-mt-8 md:-mx-12 md:-mt-12 px-4 py-3 sm:px-8 sm:py-4 z-20"
                    style={{ background: 'rgba(var(--theme-1), 0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--color-border)' }}>
                    <RouterBackButton returnPath={returnPath} />
                    <div className="flex items-center gap-2">
                        <form action={async (formData) => {
                            if (!confirm('このタスクを削除してもよろしいですか？')) return;

                            await deleteTask(formData);
                            router.replace(returnPath);
                            router.refresh();
                        }}>
                            <input type="hidden" name="id" value={task.id} />
                            <input type="hidden" name="returnPath" value={returnPath} />
                            <button
                                type="submit"
                                className="p-2 text-red-400 hover:text-red-500 rounded-full transition-colors hover:opacity-70 cursor-pointer"
                                title="タスクを削除"
                            >
                                <FaTrash className="size-4" />
                            </button>
                        </form>
                        <a
                            href={`/edit/${task.id}`}
                            className="btn-primary flex items-center gap-2 rounded-full text-xs sm:text-sm hover:opacity-90 cursor-pointer"
                        >
                            <FaEdit className="size-3 sm:size-4" />
                            <span className="hidden sm:inline">Edit Task</span>
                        </a>
                    </div>
                </header>

                {/* Title Area */}
                <div className="flex justify-between items-start gap-4 mb-2 flex-shrink-0">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="inline-block px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wide"
                                style={{ background: 'var(--color-accent-alpha)', color: 'var(--color-text-secondary)' }}>
                                {task.projects?.name || "No Project"}
                            </span>
                            {task.projects && task.projects.project_members && (
                                <div className="flex pl-1">
                                    {task.projects.project_members.map((member: { user_id: string; users: { id: string; name: string; icon: string | null } }, idx: number) => (
                                        <div
                                            key={member.user_id}
                                            className={idx === 0 ? 'relative group cursor-default' : '-ml-2 relative group cursor-default'}
                                            style={{ zIndex: 10 + idx }}
                                        >
                                            <Image
                                                src={member.users.icon || "/default_icon.svg"}
                                                alt={member.users.name || "avatar"}
                                                width={24}
                                                height={24}
                                                className="w-6 h-6 rounded-full object-cover border border-white"
                                                style={{ background: 'var(--color-surface)' }}
                                            />
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-sm"
                                                style={{ background: 'var(--color-ink)', color: 'var(--color-surface)' }}>
                                                {member.users.name}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <h1 className="text-lg sm:text-xl font-bold leading-snug" style={{ color: 'var(--color-text-primary)' }}>{task.title}</h1>
                        <div className="flex items-center gap-1 mt-1 text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
                            {task.start_date ? task.start_date.replace(/-/g, '/') : ''} ~ {task.due_date.replace(/-/g, '/')}
                        </div>
                    </div>
                    <div className="flex-shrink-0 pt-1">
                        <TaskCompleteButton id={task.id} status={task.status} size="2xl" />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-6 sticky z-10 bg-inherit flex-shrink-0 top-[50px]" style={{ borderColor: 'var(--color-border)' }}>
                    <button
                        onClick={() => setActiveTab('detail')}
                        className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors relative hover:opacity-70 cursor-pointer ${activeTab === 'detail' ? 'text-[rgb(167,146,119)] border-[rgb(167,146,119)]' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                    >
                        詳細
                    </button>
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors relative hover:opacity-70 cursor-pointer ${activeTab === 'chat' ? 'text-[rgb(167,146,119)] border-[rgb(167,146,119)]' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                    >
                        チャット
                    </button>
                </div>

                {/* Content Area */}
                <div className={`flex-1 ${activeTab === 'detail' ? 'overflow-y-auto' : 'overflow-hidden flex flex-col'}`}>
                    {activeTab === 'detail' ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300 pb-20">
                            {/* Description */}
                            <div>
                                <h2 className="font-bold text-sm mb-2" style={{ color: 'var(--color-text-primary)' }}>タスク説明</h2>
                                <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap"
                                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                                    {task.description || <span style={{ color: 'var(--color-text-muted)' }} className="italic">No description provided.</span>}
                                </div>
                            </div>

                            {/* Subtasks */}
                            <div>
                                <SubTasks sub_tasks={task.sub_tasks || []} taskId={task.id} />
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 h-full pb-4">
                            <Chat
                                taskId={task.id}
                                initialMessages={initialMessages}
                                projectMembers={task.projects?.project_members || []}
                            />
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default DrawerContent;
