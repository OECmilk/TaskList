"use client";

import { createNewTask } from "@/app/actions";
import { useRouter } from "next/navigation";

interface NewTaskFormProps {
  projects: { id: string; name: string }[];
}

const NewTaskForm = ({ projects }: NewTaskFormProps) => {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="mt-10 mx-auto w-80 sm:w-full max-w-sm">
        <form action={createNewTask}>
            <div>
                <label htmlFor="title" className="text-sm font-medium">タイトル</label>
                <span className="text-orange-500 font-semibold">*</span>
                <input type="text" id="title" name="title" required className="block py-1.5 px-2 w-full rounded-md border-0 shadow-sm ring-1 ring-inset ring-gray-300" />
            </div>
            <div className="mt-6">
                <label htmlFor="description" className="block text-sm font-medium">説明</label>
                <input type="text" id="description" name="description" className="block py-1.5 px-2 w-full rounded-md border-0 shadow-sm ring-1 ring-inset ring-gray-300" />
            </div>
            <div className="mt-6">
                <label htmlFor="dueDate" className="text-sm font-medium">期限</label>
                <span className="text-orange-600 font-semibold">*</span>
                <input type="date" id="dueDate" name="dueDate" required
                min={today} max="2100-12-31"
                className="block py-1.5 px-2 w-full rounded-md border-0 shadow-sm ring-1 ring-inset ring-gray-300" />
            </div>
            <div className="mt-6">
              <label htmlFor="projectId" className="block text-sm font-medium">プロジェクト</label>
              <select
                id="projectId"
                name="projectId"
                // 現在タスクに紐づいているプロジェクトをデフォルトで選択
                defaultValue=""
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
            <button type="submit" className="mt-8 py-2 w-full rounded-md text-white bg-cyan-700 hover:bg-cyan-600 text-sm font-semibold shadow-sm">
                Create
            </button>
            <button type="button" onClick={() => router.back()} className="mt-4 py-2 w-full rounded-md text-gray-800 bg-white hover:bg-gray-50 border border-orange-200 text-sm font-semibold shadow-sm">
              Cancel
            </button>
        </form>
    </div>
  )
};

export default NewTaskForm;