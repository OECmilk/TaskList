import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { FaEdit } from "react-icons/fa";
import RouterBackButton from "@/components/Button/RouterBackButton";
import { SubTask } from "@/app/(main)/page";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// これは、右側からスライドインする「ドロワー」コンポーネントです
const TaskDetailDrawer = async ({ params, searchParams }: PageProps) => {
  const { id } = await params;
  const sp = await searchParams;
  let returnPath = "/";
  if (Array.isArray(sp.returnPath)) {
    returnPath = sp.returnPath[0] || "/";
  } else if (typeof sp.returnPath === "string") {
    returnPath = sp.returnPath;
  }

  const supabase = createClient();


  //  スライドイン画面も、自身でデータを取得
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
    <>
      {/*  スライドインするパネル本体 */}
      <div 
        className="fixed top-0 right-0 w-full max-w-lg h-full bg-white shadow-xl z-40 overflow-y-auto animate-slideInFromRight"
        >
        <div className="p-8 sm:p-10 text-gray-800">
          
          {/*  ヘッダー（閉じるボタンと編集ボタン） */}
          <header className="flex justify-between items-center mb-8 mt-2">
            <RouterBackButton returnPath={returnPath}/>
            <a 
              href={`/edit/${task.id}`} 
              className="flex items-center gap-1 px-4 py-2 font-semibold text-white bg-cyan-700 rounded-full shadow-sm hover:bg-cyan-600"
            >
              <FaEdit className="size-5"/>
              <div className="hidden sm:inline">Edit Task</div>
            </a>
          </header>

          {/*  詳細コンテンツ（ステップ1のページとほぼ同じ） */}
          <div>
            <p className="text-sm text-gray-500">
              {task.projects?.name || "Personal Task"}
            </p>
            <h1 className="text-3xl font-bold">{task.title}</h1>
          </div>

          <div className="mt-8 bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="mb-8">{task.description || "No description."}</p>

            <h2 className="text-xl font-semibold mb-4">Sub-Tasks</h2>
            <ul className="space-y-2">
              {task.sub_tasks && task.sub_tasks.length > 0 ? (
                task.sub_tasks.map((sub: SubTask) => (
                  <li key={sub.id} className="flex items-center gap-2 p-2 bg-white rounded">
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
      </div>
    </>
  );
};

export default TaskDetailDrawer;
