import TaskCard from "@/components/TaskCard/TaskCard"
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

const ExpiredTaskPage = async () => {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Supabaseから status が true の TaskList データのみを取得
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq('status', false) // statusがfalseのレコードに絞り込む
    .lt('due_date', new Date().toISOString().split('T')[0]) // due_dateが現在の日付より前のレコードに絞り込む
    .order("due_date", { ascending: true });

  return (
    <div className="text-gray-800 p-8 h-full overflow-y-auto pb-24">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center">Expired Tasks</h1>
      </header>
      <div className="mt-8 flex flex-wrap gap-4">
        {tasks && tasks.length > 0 ? (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        ) : (
          <p>期限切れのタスクはありません</p>
        )}
      </div>
    </div>
  )
}

export default ExpiredTaskPage;