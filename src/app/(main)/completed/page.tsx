import TaskCard from "@/components/TaskCard/TaskCard";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

const CompletedTaskPage = async () => {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Supabaseから status が true の TaskList データのみを取得
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq('status', true) // statusがtrueのレコードに絞り込む
    .order("due_date", { ascending: true });

  return (
    <div className="text-gray-800 p-8 h-full overflow-y-auto pb-24">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center">Completed Tasks</h1>
      </header>
      <div className="mt-8 flex flex-wrap gap-4">
        {tasks && tasks.length > 0 ? (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        ) : (
          <p>完了したタスクはありません</p>
        )}
      </div>
    </div>
  )
}

export default CompletedTaskPage