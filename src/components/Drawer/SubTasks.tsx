'use client';

import { SubTask } from "@/app/(main)/page";
import { useState } from "react";
import { FaAngleDown } from "react-icons/fa";

const SubTasks = ({ sub_tasks }: { sub_tasks: SubTask[] }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    console.log("sub_tasks component received sub_tasks:");
    console.log(sub_tasks);

    return (
        <>
        <div 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex rounded-lg hover:text-gray-500"
        >
            <h2 className="text-xl font-semibold mb-4">SubTasks</h2>
            <FaAngleDown className="size-5 ml-2 mt-1" />
        </div>

        {isExpanded && (
            <ul className="space-y-2">
                {sub_tasks && sub_tasks.length > 0 ? (
                sub_tasks.map((sub: SubTask) => (
                    <li key={sub.id} className="flex items-center gap-2 p-2 bg-white rounded truncate">
                    <span className={sub.status ? "line-through text-gray-400" : ""}>
                        {sub.title}
                    </span>
                    </li>
                ))
                ) : (
                <p className="text-gray-500">No sub-tasks.</p>
                )}
            </ul>
        )}
        </>
    );
}   
export default SubTasks;