"use client";

import { deleteSubTask } from "@/app/actions";
import { FaTrashAlt } from "react-icons/fa";

interface SubTaskDeleteButtonProps {
    id: number;
    taskId: number;
}

const SubTaskDeleteButton: React.FC<SubTaskDeleteButtonProps> = ({ id, taskId }) => {
    // Server Actionに渡す引数を事前にバインドする
    const actionWithArgs = deleteSubTask.bind(null, id, taskId);

    return (
        <button type="submit" formAction={actionWithArgs} className="mt-3 hover:text-gray-600 text-lg cursor-pointer">
            <FaTrashAlt />
        </button>
  );
};

export default SubTaskDeleteButton;