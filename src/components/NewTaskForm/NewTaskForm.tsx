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
      <div className="card p-8">
        <form action={createNewTask} className="space-y-5">

          {/* Hidden input for return path if provided */}
          {returnTo && <input type="hidden" name="returnTo" value={returnTo} />}

          {/* Title Input */}
          <div className="space-y-1.5">
            <label htmlFor="title" className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
              タイトル <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              placeholder="タスクの名前を入力"
              className="input-field"
            />
          </div>

          {/* Description Input */}
          <div className="space-y-1.5">
            <label htmlFor="description" className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
              説明
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="タスクの詳細など"
              className="input-field resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Due Date Input */}
            <div className="space-y-1.5">
              <label htmlFor="dueDate" className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                期限 <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                required
                min={today}
                max="2100-12-31"
                className="input-field"
              />
            </div>

            {/* Project Select */}
            <div className="space-y-1.5">
              <label htmlFor="projectId" className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                プロジェクト
              </label>
              <div className="relative">
                <select
                  id="projectId"
                  name="projectId"
                  defaultValue={defaultProjectId || ""}
                  className="input-field appearance-none cursor-pointer"
                >
                  <option value="">プロジェクトなし</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3" style={{ color: 'var(--color-text-muted)' }}>
                  <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex flex-col gap-3">
            <button
              type="submit"
              className="btn-primary w-full py-3"
            >
              Create Task
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="btn-secondary w-full py-3"
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