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
    <div className="mt-8 mx-auto w-full max-w-lg">
      <div className="card p-8">
        <form action={editTask} className="space-y-6">
          <input type="hidden" name="id" value={task.id} />

          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="title" className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>タイトル</label>
            <input
              type="text"
              id="title"
              name="title"
              required
              defaultValue={task.title}
              className="input-field"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="description" className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>説明</label>
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={task.description || ''}
              className="input-field resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Due Date */}
            <div className="space-y-1.5">
              <label htmlFor="dueDate" className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>期限</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                required
                defaultValue={task.due_date}
                min="2025-08-03"
                max="2100-12-31"
                className="input-field"
              />
            </div>

            {/* Project */}
            <div className="space-y-1.5">
              <label htmlFor="projectId" className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>プロジェクト</label>
              <div className="relative">
                <select
                  id="projectId"
                  name="projectId"
                  defaultValue={task.project_id ? task.project_id : ""}
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

          {/* --- SubTasks Section --- */}
          <div className="pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>サブタスク</h3>
              <span className="text-xs font-medium px-2 py-1 rounded-lg" style={{ background: 'var(--color-accent-alpha)', color: 'var(--color-text-secondary)' }}>
                {task.sub_tasks ? task.sub_tasks.length : 0} 件
              </span>
            </div>

            <div className="space-y-3">
              {task.sub_tasks && task.sub_tasks.length > 0 ? (
                task.sub_tasks.map(subtask => (
                  <div key={subtask.id} className="group p-4 rounded-2xl transition-all duration-200"
                    style={{ background: 'var(--color-surface)', border: '2px solid transparent' }}>
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`font-bold truncate ${subtask.status ? "line-through opacity-60" : ""}`}
                          style={{ color: subtask.status ? 'var(--color-text-muted)' : 'var(--color-text-primary)' }}
                        >
                          {subtask.title}
                        </h4>
                        {subtask.description && (
                          <p className="text-sm mt-1 line-clamp-1" style={{ color: 'var(--color-text-muted)' }}>{subtask.description}</p>
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
                <div className="text-center py-8 rounded-2xl border-2 border-dashed" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>No subtasks yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col gap-3">
            <button type="submit" className="btn-primary w-full py-3.5">
              Save Changes
            </button>
            <button type="button" onClick={() => router.push('/')} className="btn-secondary w-full py-3.5">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditTaskForm;