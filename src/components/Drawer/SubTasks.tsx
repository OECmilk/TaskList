'use client';

import { SubTask } from "@/types";
import { useState, useRef } from "react";
import { FaCheckCircle, FaRegCircle, FaTrashAlt, FaPlus, FaChevronUp, FaChevronDown } from "react-icons/fa";
import { addSubTask, updateSubTaskStatus, deleteSubTask } from "@/app/actions";

const SubTasks = ({ sub_tasks, taskId }: { sub_tasks: SubTask[], taskId: number }) => {
    const [isExpanded, setIsExpanded] = useState(false); // Default collapsed
    const formRef = useRef<HTMLFormElement>(null);

    const handleAddSubTask = async (formData: FormData) => {
        formRef.current?.reset();
        await addSubTask(formData);
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-700 text-sm">Subtasks</h3>
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-[10px] rounded-full font-bold">
                        {sub_tasks.length}
                    </span>
                </div>
                {isExpanded ? <FaChevronUp className="text-gray-400 text-xs" /> : <FaChevronDown className="text-gray-400 text-xs" />}
            </button>

            <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100 border-t border-gray-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="p-4 space-y-3">
                    {sub_tasks && sub_tasks.length > 0 ? (
                        sub_tasks.map((sub: SubTask) => (
                            <div key={sub.id} className="group flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-xl shadow-[0_2px_8px_rgb(0,0,0,0.02)] hover:shadow-md transition-all duration-200">
                                <button
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        await updateSubTaskStatus(sub.id, taskId, sub.status);
                                    }}
                                    className={`flex-shrink-0 ${sub.status ? "text-cyan-500" : "text-gray-300"} hover:scale-110 transition-transform`}
                                >
                                    {sub.status ? <FaCheckCircle className="size-5" /> : <FaRegCircle className="size-5" />}
                                </button>

                                <span className={`font-medium text-gray-700 truncate flex-1 ${sub.status ? "line-through text-gray-400" : ""}`}>
                                    {sub.title}
                                </span>

                                <button
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        await deleteSubTask(sub.id, taskId);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-2 rounded-full hover:bg-red-50"
                                >
                                    <FaTrashAlt className="size-4" />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-6 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-sm text-gray-400 font-medium">No subtasks yet</p>
                        </div>
                    )}

                    {/* Add Subtask Form */}
                    <form ref={formRef} action={handleAddSubTask} className="mt-4 flex gap-2">
                        <input type="hidden" name="task_id" value={taskId} />
                        <input
                            type="hidden"
                            name="description"
                            value=""
                        />
                        <div className="relative flex-1">
                            <input
                                type="text"
                                name="title"
                                placeholder="Add a subtask..."
                                required
                                className="w-full pl-4 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-cyan-400 outline-none text-sm transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            className="p-3 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all"
                        >
                            <FaPlus className="size-4" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
export default SubTasks;