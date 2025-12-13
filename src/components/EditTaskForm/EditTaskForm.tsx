"use client";

import { Task, Project } from "@/types";
import { editTask } from "@/app/actions";
import { useRouter } from "next/navigation";
import SubTaskCompleteButton from "./SubTaskCompleteButton/SubTaskCompleteButton";
import SubTaskDeleteButton from "./SubTaskDeleteButton/SubTaskDeleteButton";

interface EditTaskFormProps {
  task: Task;
  projects: Project[];
}

const EditTaskForm = ({ task, projects }: EditTaskFormProps) => {
  const router = useRouter();

  return (
    <div className="mt-8 mx-auto w-full max-w-lg"> {/* Slightly wider for edit mode */}
      <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <form action={editTask} className="space-y-6">
          <input type="hidden" name="id" value={task.id} />

          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-bold text-gray-700 ml-1">タイトル</label>
            <input
              type="text"
              id="title"
              name="title"
              required
              defaultValue={task.title}
              className="block w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-cyan-500/30 focus:ring-4 focus:ring-cyan-500/10 transition-all duration-200 outline-none font-medium text-gray-800"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-bold text-gray-700 ml-1">説明</label>
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={task.description || ''}
              className="block w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-cyan-500/30 focus:ring-4 focus:ring-cyan-500/10 transition-all duration-200 outline-none font-medium text-gray-600 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Due Date */}
            <div className="space-y-2">
              <label htmlFor="dueDate" className="text-sm font-bold text-gray-700 ml-1">期限</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                required
                defaultValue={task.due_date}
                min="2025-08-03"
                max="2100-12-31"
                className="block w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-cyan-500/30 focus:ring-4 focus:ring-cyan-500/10 transition-all duration-200 outline-none font-medium text-gray-600"
              />
            </div>

            {/* Project */}
            <div className="space-y-2">
              <label htmlFor="projectId" className="text-sm font-bold text-gray-700 ml-1">プロジェクト</label>
              <div className="relative">
                <select
                  id="projectId"
                  name="projectId"
                  defaultValue={task.project_id ? task.project_id : ""}
                  className="appearance-none block w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-cyan-500/30 focus:ring-4 focus:ring-cyan-500/10 transition-all duration-200 outline-none font-medium text-gray-700 cursor-pointer"
                >
                  <option value="">プロジェクトなし</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
              </div>
            </div>
          </div>

          {/* --- SubTasks Section --- */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">SubTasks</h3>
              <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-500 rounded-lg">
                {task.sub_tasks ? task.sub_tasks.length : 0} items
              </span>
            </div>

            <div className="space-y-3">
              {task.sub_tasks && task.sub_tasks.length > 0 ? (
                task.sub_tasks.map(subtask => (
                  <div key={subtask.id} className="group p-4 bg-gray-50 hover:bg-white border-2 border-transparent hover:border-cyan-100 rounded-2xl transition-all duration-200">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-800 truncate">{subtask.title}</h4>
                        {subtask.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1">{subtask.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <SubTaskCompleteButton id={subtask.id} taskId={subtask.task_id} status={subtask.status} />
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <SubTaskDeleteButton id={subtask.id} taskId={subtask.task_id} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <p className="text-sm text-gray-400 font-medium">No subtasks yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col gap-3">
            <button type="submit" className="w-full py-3.5 rounded-xl text-white bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 shadow-lg shadow-cyan-500/30 transition-all duration-200 font-bold tracking-wide active:scale-[0.98]">
              Save Changes
            </button>
            <button type="button" onClick={() => router.push('/')} className="w-full py-3.5 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all duration-200 font-bold active:scale-[0.98]">
              Cancel
            </button>
          </div>
        </form>


      </div>
    </div>
  )
}

export default EditTaskForm;