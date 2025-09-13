import { Task } from "@/app/(main)/page";
import { editTask } from "@/app/actions";

interface EditTaskFormProps {
  task: Task;
}

const EditTaskForm = ({ task }: EditTaskFormProps) => {
  return (
    <div className="mt-10 mx-auto w-full max-w-sm">
        <form action={editTask}>
            <input type="hidden" name="id" value={task.id} />
            <div>
                <label htmlFor="title" className="block text-sm font-medium">タイトル</label>
                <input type="text" id="title" name="title" required defaultValue={task.title} className="block py-1.5 px-2 w-full rounded-md border-0 shadow-sm ring-1 ring-inset ring-gray-300" />
            </div>
            <div className="mt-6">
                <label htmlFor="description" className="block text-sm font-medium">説明</label>
                <input type="text" id="description" name="description" required 
               defaultValue={task.description || ''} className="block py-1.5 px-2 w-full rounded-md border-0 shadow-sm ring-1 ring-inset ring-gray-300" />
            </div>
            <div className="mt-6">
                <label htmlFor="dueDate" className="block text-sm font-medium">期限</label>
                <input type="date" id="dueDate" name="dueDate" required defaultValue={task.due_date}
                min="2025-08-03" max="2100-12-31"
                className="block py-1.5 px-2 w-full rounded-md border-0 shadow-sm ring-1 ring-inset ring-gray-300" />
            </div>
            <button type="submit" className="mt-8 py-2 w-full rounded-md text-white bg-gray-800 hover:bg-gray-700 text-sm font-semibold shadow-sm">
                Edit
            </button>
        </form>
    </div>
  )
}

export default EditTaskForm