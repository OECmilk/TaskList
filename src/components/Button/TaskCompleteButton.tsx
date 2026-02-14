import { updateTaskStatus } from "@/app/actions";
import { FaCheckCircle } from "react-icons/fa";

interface TaskCompleteButtonProps {
    id: number;
    status: boolean;
    size: string;
}

const TaskCompleteButton: React.FC<TaskCompleteButtonProps> = ({ id, status, size }) => {

    return (
        <form action={updateTaskStatus}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="status" value={status.toString()} />

            <button type="submit" className={`hover:opacity-70 text-${size} cursor-pointer`}>
                <FaCheckCircle style={{ color: status ? 'rgb(163, 220, 154)' : 'var(--color-text-muted)' }} />
            </button>
        </form>
    )
}

export default TaskCompleteButton;