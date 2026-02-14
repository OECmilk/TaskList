import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FaEdit } from "react-icons/fa";
import { SubTask } from "@/types";


type PageProps = {
  params: Promise<{ id: string }>;
};

const TaskDetailPage = async ({ params }: PageProps) => {
  const { id } = await params;

  const supabase = createClient();

  const { data: task, error } = await supabase
    .from("tasks")
    .select(
      `
        *,
        sub_tasks ( * ),
        projects ( name )
      `
    )
    .eq("id", id)
    .single();

  if (error || !task) {
    notFound();
  }

  return (
    <div className="p-8 sm:p-10" style={{ color: 'var(--color-text-primary)' }}>
      <header className="flex justify-between items-center mb-8">
        <div>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {task.projects?.name || "Personal Task"}
          </p>
          <h1 className="text-3xl font-bold">{task.title}</h1>
        </div>
        <Link
          href={`/edit/${task.id}`}
          className="btn-primary flex items-center gap-2"
        >
          <FaEdit />
          Edit Task
        </Link>
      </header>

      <div className="card p-8">
        <h2 className="text-xl font-semibold mb-4">Description</h2>
        <p className="mb-8" style={{ color: 'var(--color-text-secondary)' }}>{task.description || "No description."}</p>

        <h2 className="text-xl font-semibold mb-4">Sub-Tasks</h2>
        <ul className="space-y-2">
          {task.sub_tasks && task.sub_tasks.length > 0 ? (
            task.sub_tasks.map((sub: SubTask) => (
              <li key={sub.id} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'var(--color-surface)' }}>
                <span className={sub.status ? "line-through" : ""} style={{ color: sub.status ? 'var(--color-text-muted)' : 'var(--color-text-primary)' }}>
                  {sub.title}
                </span>
              </li>
            ))
          ) : (
            <p style={{ color: 'var(--color-text-muted)' }}>No sub-tasks.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default TaskDetailPage;
