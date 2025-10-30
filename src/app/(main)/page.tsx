import TaskCard from "@/components/TaskCard/TaskCard";
import Link from "next/link";
import { MdAddTask } from "react-icons/md";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import TaskFilter from "@/components/TaskFilter/TaskFilter";
import { UUID } from "crypto";

// subTaskの型を定義
export type SubTask = {
  id: number;
  task_id: number;
  title: string;
  description: string | null;
  status: boolean;
};

// Projectの型を定義
export type Project = {
  id: number;
  name: string;
  owner: string;
  status: boolean;
};


// Taskの型定義
export type Task = {
  id: number;
  title: string;
  description: string | null;
  status: boolean;
  due_date: string;
  user_id: UUID;
  project_id: number | null;
  sub_tasks?: SubTask[];
  projects?: Project;
};

export default async function MainPage(
  props: { searchParams:  Promise<{[key: string]: string | string[] | undefined }> }
){
  
  const searchParams = await props.searchParams;

  // URLに show_incomplete=false があれば 'false'、それ以外は 'true' と解釈する
  const showIncompleteOnly = searchParams.show_incomplete !== 'false';

  const supabase = createClient();

  // 💡 Supabaseクエリの構築
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  let query = supabase
    .from("tasks")
    .select(
      `
        *,
        sub_tasks (
          *
        ),
        projects (
          *
        )
      `
    )
    .eq('user_id', user.id)
    .order("due_date", { ascending: true })
    .order("id", { foreignTable: "sub_tasks", ascending: true });

  // 💡 フィルタリング条件の適用
  if (showIncompleteOnly) {
    // showIncompleteがtrueの場合、statusがfalse（未完了）のタスクのみを取得
    query = query
      .eq('status', false);
  }

  // Supabaseからデータを取得
  const { data: tasks, error } = await query;
  if (error) {
    console.error('Error fetching tasks:', error);
  }

  return (
    <div className="text-gray-800 p-8 sm:p-10 h-full overflow-y-auto pb-24">
      <header className="flex justify-between items-center mt-2">
        <div className="flex items-center gap-10">
          <h1 className="hidden sm:inline text-2xl font-bold flex items-center">Tasks</h1>
          <TaskFilter />
        </div>
        <Link href="/new" prefetch={true} className="flex items-center gap-1 px-4 py-2 font-semibold text-white rounded-full shadow-sm bg-cyan-700 hover:bg-cyan-600">
          <MdAddTask className="size-5"/>
          <div className="hidden sm:inline">Add Task</div>
        </Link>
      </header>
      <div className="mt-8 flex flex-wrap justify-center md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {tasks && tasks.length > 0 ? (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        ) : (
          <p>現在タスクはありません</p>
        )}
      </div>
    </div>
  );
};
