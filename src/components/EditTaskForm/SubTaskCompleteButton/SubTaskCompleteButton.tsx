"use client";

import { updateSubTaskStatus } from "@/app/actions";
import { FaCheckCircle } from "react-icons/fa";

interface SubTaskCompleteButtonProps {
    id: number;
    taskId: number;
    status: boolean;
}

const SubTaskCompleteButton: React.FC<SubTaskCompleteButtonProps> = ({ id, taskId, status }) => {
    // Server Actionに渡す引数を事前にバインドする
    const actionWithArgs = updateSubTaskStatus.bind(null, id, taskId, status);

    return (
        <button type="submit" formAction={actionWithArgs} className="hover:opacity-70 text-lg cursor-pointer">
            <FaCheckCircle style={{ color: status ? 'rgb(163, 220, 154)' : 'var(--color-text-muted)' }} />
        </button>
    )
}

export default SubTaskCompleteButton;