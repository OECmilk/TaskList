import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FaEdit } from "react-icons/fa";
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react";
import { SubTask } from "../../page";


type PageProps = {
  params: Promise<{ id: string }>;
};

// サーバーコンポーネントとして、ページ自身がデータを取得します
const TaskDetailPage = async ({ params }: PageProps) => {
  const { id } = await params;

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // IDに基づいてタスク、サブタスク、プロジェクト情報を取得
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
    <div className="p-8 sm:p-10 text-gray-800">
      <header className="flex justify-between items-center mb-8">
        <div>
          <p className="text-sm text-gray-500">
            {task.projects?.name || "Personal Task"}
          </p>
          <h1 className="text-3xl font-bold">{task.title}</h1>
        </div>
        <Link 
          href={`/edit/${task.id}`} 
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-cyan-700 rounded-md hover:bg-cyan-600"
        >
          <FaEdit />
          Edit Task
        </Link>
      </header>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Description</h2>
        <p className="mb-8">{task.description || "No description."}</p>

        <h2 className="text-xl font-semibold mb-4">Sub-Tasks</h2>
        <ul className="space-y-2">
          {task.sub_tasks && task.sub_tasks.length > 0 ? (
            task.sub_tasks.map((sub: SubTask) => (
              <li key={sub.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <span className={sub.status ? "line-through text-gray-400" : ""}>
                  {sub.title}
                </span>
              </li>
            ))
          ) : (
            <p className="text-gray-500">No sub-tasks.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default TaskDetailPage;
