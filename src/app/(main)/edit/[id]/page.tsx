import EditTaskForm from "@/components/EditTaskForm/EditTaskForm";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

type EditTaskPageProps = {
  params: Promise<{ id: string }>;
};


const EditTaskPage = async ({ params }: EditTaskPageProps) => {
  const { id } = await params;

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // URLのIDに一致するタスクをSupabaseから取得
  const { data: task, error } = await supabase
    .from("tasks")
    .select(`
      *,
      sub_tasks (
        *
      )
    `)
    .order('id', { foreignTable: 'sub_tasks', ascending: true })
    .eq("id", id)
    .single(); // 単一のレコードを取得

  if (error || !task) {
    return notFound();
  }

  return (
    <div className="flex flex-col justify-center py-20">
        <h2 className="text-center text-2xl font-bold">Edit Task</h2>
        <EditTaskForm task={task}/>
    </div>
  )
};

export default EditTaskPage;