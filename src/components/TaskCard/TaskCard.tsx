import TaskDeleteButton from "./TaskDeleteButton/TaskDeleteButton";
import TaskEditButton from "./TaskEditButton/TaskEditButton";
import TaskCompleteButton from "./TaskCompleteButton/TaskCompleteButton";
import { Task } from "@/app/(main)/page";

const TaskCard = ({ task }: { task: Task }) => {
  return (
    <div className="w-64 h-52 p-4 bg-white rounded-md shadow-md flex flex-col justify-between">
        <header>
            <div className="flex justify-end">
                <TaskCompleteButton id={ task.id } status={ task.status }/>
            </div>
            <h1 className="text-lg font-semibold">{ task.title }</h1>
            <div className="mt-1 text-sm line-clamp-3">{ task.description }</div>
        </header>
        <div>
            <div className="text-sm">{ task.due_date }</div>
            <div className="flex justify-between items-center">
                <div className={`mt-1 text-sm px-2 py-1 w-24 text-center text-white rounded-full shadow-sm ${task.status ? 'bg-green-500': 'bg-red-500'}`}>
                    { task.status ? 'Completed': 'Incomplete'}</div>
                <div className="flex gap-4">
                    <TaskEditButton id={ task.id }/>
                    <TaskDeleteButton id={ task.id }/>
                </div>
            </div>
        </div>
    </div>
  )
}

export default TaskCard