"use client";

import { createNewTask } from "@/app/actions";
import { useRouter } from "next/navigation";

interface NewTaskFormProps {
  projects: { id: string; name: string }[];
  defaultProjectId?: string;
  returnTo?: string;
}

const NewTaskForm = ({ projects, defaultProjectId, returnTo }: NewTaskFormProps) => {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];

  const handleCancel = () => {
    if (returnTo) {
      router.push(returnTo);
    } else {
      router.back();
    }
  };

  return (
    <div className="mt-8 mx-auto w-full max-w-md">
      <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <form action={createNewTask} className="space-y-6">

          {/* Hidden input for return path if provided */}
          {returnTo && <input type="hidden" name="returnTo" value={returnTo} />}

          {/* Title Input */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-bold text-gray-700 ml-1">
              タイトル <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              placeholder="タスクの名前を入力"
              className="block w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-cyan-500/30 focus:ring-4 focus:ring-cyan-500/10 transition-all duration-200 outline-none font-medium placeholder:text-gray-400"
            />
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-bold text-gray-700 ml-1">
              説明
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="タスクの詳細など"
              className="block w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-cyan-500/30 focus:ring-4 focus:ring-cyan-500/10 transition-all duration-200 outline-none font-medium placeholder:text-gray-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Due Date Input */}
            <div className="space-y-2">
              <label htmlFor="dueDate" className="text-sm font-bold text-gray-700 ml-1">
                期限 <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                required
                min={today}
                max="2100-12-31"
                className="block w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-cyan-500/30 focus:ring-4 focus:ring-cyan-500/10 transition-all duration-200 outline-none font-medium text-gray-600"
              />
            </div>

            {/* Project Select */}
            <div className="space-y-2">
              <label htmlFor="projectId" className="text-sm font-bold text-gray-700 ml-1">
                プロジェクト
              </label>
              <div className="relative">
                <select
                  id="projectId"
                  name="projectId"
                  defaultValue={defaultProjectId || ""}
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

          {/* Actions */}
          <div className="pt-4 flex flex-col gap-3">
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl text-white bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 shadow-lg shadow-cyan-500/30 transition-all duration-200 font-bold tracking-wide active:scale-[0.98]"
            >
              Create Task
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="w-full py-3.5 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all duration-200 font-bold active:scale-[0.98]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
};

export default NewTaskForm;