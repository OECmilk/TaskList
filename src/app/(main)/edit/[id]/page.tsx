import EditTaskForm from "@/components/EditTaskForm/EditTaskForm";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export type Task = {
  id: number;
  title: string;
  description: string | null;
  status: boolean;
  due_date: string;
};

type EditTaskPageProps = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

const EditTaskPage = async ({ params }: EditTaskPageProps) => {
  const id = params.id;

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // URLのIDに一致するタスクをSupabaseから取得
  const { data: task, error } = await supabase
    .from("TaskList")
    .select("*")
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