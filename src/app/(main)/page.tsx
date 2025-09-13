import TaskCard from "@/components/TaskCard/TaskCard";
import Link from "next/link";
import { MdAddTask } from "react-icons/md";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

// Taskの型定義
export type Task = {
  id: number;
  title: string;
  description: string | null;
  status: boolean;
  due_date: string;
};

export default async function MainPage() {
  //Supabaseクライアントの初期化
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // SupabaseからTaskListデータを取得
  const { data: tasks, error } = await supabase
    .from("TaskList")
    .select("*")
    .order("id", { ascending: true });

    if (error) {
      console.error('Error fetching tasks:', error);
    }

  return (
    <div className="text-gray-800 p-8 h-full overflow-y-auto pb-24">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center">All Tasks</h1>
        <Link href="/new" className="flex items-center gap-1 font-semibold border px-4 py-2 rounded-full shadow-sm text-white bg-gray-800 hover:bg-gray-700">
          <MdAddTask className="size-5"/>
          <div>Add Task</div>
        </Link>
      </header>
      <div className="mt-8 flex flex-wrap gap-4">
        {tasks && tasks.length > 0 ? (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        ) : (
          <p>現在タスクはありません</p>
        )}
      </div>
    </div>
  );
}
