"use client";

import { Task, Project } from "@/app/(main)/page";
import { editTask, addSubTask } from "@/app/actions";
import { useRouter } from "next/navigation";
import SubTaskCompleteButton from "./SubTaskCompleteButton/SubTaskCompleteButton";
import SubTaskDeleteButton from "./SubTaskDeleteButton/SubTaskDeleteButton";

interface EditTaskFormProps {
  task: Task;
  projects: Project[];
}

const EditTaskForm = ({ task, projects }: EditTaskFormProps ) => {
  const router = useRouter();

  console.log("-----projects-----");
  console.log(projects);

  return (
    <div className="mt-10 mx-auto w-80 sm:w-full max-w-sm">
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

            {/* --- ▼ Project選択プルダウンを追加 ▼ --- */}
            <div className="mt-6">
              <label htmlFor="projectId" className="block text-sm font-medium">プロジェクト</label>
              <select
                id="projectId"
                name="projectId"
                // 現在タスクに紐づいているプロジェクトをデフォルトで選択
                defaultValue={task.project_id ? task.project_id : ""}
                className="block py-1.5 px-2 w-full rounded-md border-0 shadow-sm ring-1 ring-inset ring-gray-300"
              >
                <option value="">プロジェクトなし</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* --- SubTask表示エリア --- */}
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-2 border-b pb-1">SubTasks</h3>
              <div className="space-y-3 max-h-48 overflow-y-auto p-2">
                {task.sub_tasks && task.sub_tasks.length > 0 ? (
                  task.sub_tasks.map(subtask => (
                    <div key={subtask.id} className="p-2 border rounded-md shadow-sm">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold">{subtask.title}</h4>
                        
                        <SubTaskCompleteButton id={ subtask.id } taskId={ subtask.task_id } status={ subtask.status }/>

                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600 mt-1">{subtask.description}</p>
                        <SubTaskDeleteButton id={ subtask.id } taskId={ subtask.task_id }/>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">このタスクのサブタスクはありません。</p>
                )}
              </div>
            </div>

            <button type="submit" className="mt-8 py-2 w-full rounded-md text-white bg-cyan-700 hover:bg-cyan-600 text-sm font-semibold shadow-sm">
                Edit
            </button>
            <button type="button" onClick={() => router.back()} className="mt-4 py-2 w-full rounded-md text-gray-800 bg-white border border-orange-300 hover:bg-gray-50 text-sm font-semibold shadow-sm">
              Cancel
            </button>
        </form>

        {/* --- SubTask追加フォーム --- */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="text-lg font-medium mb-2">Add Subtask</h4>
          <form action={addSubTask}>
              {/* どのタスクの子であるかを伝えるためのhiddenフィールド */}
              <input type="hidden" name="task_id" value={task.id} />
              <div className="mb-2">
                  <label htmlFor="subtask_title" className="sr-only">Subtask Title</label>
                  <input 
                      id="subtask_title"
                      name="title"
                      type="text" 
                      required 
                      placeholder="タイトル"
                      className="block py-1.5 px-2 w-full rounded-md border-0 shadow-sm ring-1 ring-inset ring-gray-300" 
                  />
              </div>
              <div className="mb-2">
                  <label htmlFor="subtask_description" className="sr-only">Subtask Description</label>
                  <textarea 
                      id="subtask_description"
                      name="description" 
                      rows={2}
                      placeholder="説明"
                      className="block py-1.5 px-2 w-full rounded-md border-0 shadow-sm ring-1 ring-inset ring-gray-300"
                  ></textarea>
              </div>
              <button type="submit" className="mt-2 py-2 w-full rounded-md text-white bg-cyan-700 hover:bg-cyan-600 text-sm font-semibold shadow-sm">
                  Add Subtask
              </button>
          </form>
        </div>
    </div>
  )
}

export default EditTaskForm;