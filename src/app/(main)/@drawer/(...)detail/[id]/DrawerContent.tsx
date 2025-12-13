'use client';

import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaEdit } from "react-icons/fa";
import RouterBackButton from "@/components/Button/RouterBackButton";
import Chat, { ChatMessage } from "@/components/Chat/Chat";
import SubTasks from "@/components/Drawer/SubTasks";
import TaskCompleteButton from "@/components/Button/TaskCompleteButton";
import { Task } from "@/types";
import Image from "next/image";

type DrawerContentProps = {
    task: Task;
    initialMessages: ChatMessage[];
    returnPath: string;
};

const DrawerContent = ({ task, initialMessages, returnPath }: DrawerContentProps) => {
    const router = useRouter();
    const panelRef = useRef<HTMLDivElement>(null);

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
            className="fixed top-0 right-0 w-full max-w-3xl h-full bg-white/95 backdrop-blur-xl shadow-2xl z-40 overflow-y-auto animate-slideInFromRight border-l border-gray-100"
        >
            <div className="p-4 sm:p-8 md:p-12 text-gray-800 pb-20 sm:pb-12"> {/* Reduced padding for mobile */}

                {/* Header */}
                <header className="flex justify-between items-center mb-4 sm:mb-8 sticky top-0 bg-white/80 backdrop-blur-md -mx-4 -mt-4 sm:-mx-8 sm:-mt-8 md:-mx-12 md:-mt-12 px-4 py-3 sm:px-8 sm:py-4 z-10 border-b border-gray-100">
                    <RouterBackButton returnPath={returnPath} />
                    <a
                        href={`/edit/${task.id}`}
                        className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-2.5 font-bold text-white bg-gradient-to-r from-cyan-600 to-cyan-500 rounded-full shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/40 hover:scale-105 transition-all text-xs sm:text-sm"
                    >
                        <FaEdit className="size-3 sm:size-4" />
                        <span className="hidden sm:inline">Edit Task</span>
                    </a>
                </header>

                {/* Title Area */}
                <div className="flex justify-between items-start gap-4 mb-4 sm:mb-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="inline-block px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-gray-100 text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                                {task.projects?.name || "No Project"}
                            </span>
                            {/* Project Member Icons */}
                            {task.projects && task.projects.project_members && (
                                <div className="flex pl-1">
                                    {task.projects.project_members.map((member: { user_id: string; users: { id: string; name: string; icon: string | null } }, idx: number) => (
                                        <div
                                            key={member.user_id}
                                            className={idx === 0 ? 'relative' : '-ml-2 relative'}
                                            style={{ zIndex: 10 + idx }}
                                            title={member.users.name}
                                        >
                                            <Image
                                                src={member.users.icon || "/default_icon.svg"}
                                                alt={member.users.name || "avatar"}
                                                width={24}
                                                height={24}
                                                className="w-6 h-6 rounded-full object-cover border border-white bg-gray-200"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <h1 className="text-lg sm:text-xl font-bold text-gray-800 leading-snug">{task.title}</h1>
                    </div>
                    <div className="flex-shrink-0 pt-1">
                        <TaskCompleteButton id={task.id} status={task.status} size="2xl" /> {/* Reduced size for mobile logic handled in component? or just accept it fits */}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mt-4 sm:mt-8">
                    {/* Left Column (Details) */}
                    <div className="md:col-span-1 space-y-4 sm:space-y-8">
                        {/* Description - Make more compact on mobile */}
                        <div>
                            <h2 className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 sm:mb-2">Description</h2>
                            <div className="p-3 sm:p-5 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-100 text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {task.description || <span className="text-gray-400 italic">No description provided.</span>}
                            </div>
                        </div>

                        {/* Subtasks */}
                        <div>
                            <SubTasks sub_tasks={task.sub_tasks || []} taskId={task.id} />
                        </div>
                    </div>
                    {/* Right Column (Chat) - 50% */}
                    <div className="md:col-span-1">
                        <Chat
                            taskId={task.id}
                            initialMessages={initialMessages}
                            projectMembers={task.projects?.project_members || []}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DrawerContent;
