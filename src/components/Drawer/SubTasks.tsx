'use client';

import { SubTask } from "@/types";
import { useRef } from "react";
import { FaCheckCircle, FaRegCircle, FaTrashAlt, FaPlus } from "react-icons/fa";
import { addSubTask, updateSubTaskStatus, deleteSubTask } from "@/app/actions";

const SubTasks = ({ sub_tasks, taskId }: { sub_tasks: SubTask[], taskId: number }) => {
    const formRef = useRef<HTMLFormElement>(null);

    const handleAddSubTask = async (formData: FormData) => {
        const title = formData.get('title') as string;
        if (!title?.trim()) return;

        await addSubTask(formData);
        formRef.current?.reset();
    };

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                サブタスク
                <span className="px-2 py-0.5 text-[10px] rounded-full font-bold" style={{ background: 'var(--color-accent-alpha)', color: 'var(--color-text-secondary)' }}>
                    {sub_tasks.length}
                </span>
            </h3>

            {/* Add Subtask Form - Moved to Top */}
            <form ref={formRef} action={handleAddSubTask} className="flex gap-2 mb-4">
                <input type="hidden" name="task_id" value={taskId} />
                <input type="hidden" name="description" value="" />
                <div className="relative flex-1">
                    <input
                        type="text"
                        name="title"
                        placeholder="Add a subtask..."
                        required
                        className="w-full px-4 py-3 rounded-xl text-sm transition-all focus:ring-2 focus:ring-blue-500 outline-none"
                        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                    />
                </div>
                <button
                    type="submit"
                    className="flex-shrink-0 p-3 rounded-full transition-colors hover:opacity-90 active:scale-95 text-white bg-black"
                >
                    <FaPlus className="size-4" />
                </button>
            </form>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {sub_tasks && sub_tasks.length > 0 ? (
                    sub_tasks.map((sub: SubTask) => (
                        <div key={sub.id} className="group flex items-center gap-3 p-3 rounded-xl transition-all hover:shadow-sm"
                            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                            <form action={async () => {
                                await updateSubTaskStatus(sub.id, taskId, sub.status);
                            }}>
                                <button
                                    type="submit"
                                    className="flex-shrink-0 hover:scale-110 transition-transform cursor-pointer pt-1"
                                    style={{ color: sub.status ? 'rgb(163, 220, 154)' : 'var(--color-text-muted)' }}
                                >
                                    {sub.status ? <FaCheckCircle className="size-5" /> : <FaRegCircle className="size-5" />}
                                </button>
                            </form>

                            <span className={`font-medium truncate flex-1 text-sm ${sub.status ? "line-through opacity-60" : ""}`}
                                style={{ color: sub.status ? 'var(--color-text-muted)' : 'var(--color-text-primary)' }}>
                                {sub.title}
                            </span>

                            <form action={async () => {
                                if (!confirm('Delete this subtask?')) return;
                                await deleteSubTask(sub.id, taskId);
                            }}>
                                <button
                                    type="submit"
                                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 transition-all p-2 rounded-full hover:bg-red-50"
                                >
                                    <FaTrashAlt className="size-3" />
                                </button>
                            </form>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 rounded-xl border-2 border-dashed" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-elevated)' }}>
                        <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>No subtasks yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}
export default SubTasks;