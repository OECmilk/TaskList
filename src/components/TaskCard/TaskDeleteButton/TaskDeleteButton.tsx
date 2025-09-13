import { deleteTask } from "@/app/actions";
import { FaTrashAlt } from "react-icons/fa";

interface TaskDeleteButtonProps {
    id: number;
}

const TaskDeleteButton: React.FC<TaskDeleteButtonProps> = ({ id }) => {
  return (
    <form action={deleteTask}>
        <input type="hidden" name="id" value={id} />
        <button type="submit" className="hover:text-gray-700 text-lg cursor-pointer">
            <FaTrashAlt />
        </button>
    </form>
  )
}

export default TaskDeleteButton;