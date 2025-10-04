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

  const { data: { user } } = await supabase.auth.getUser();

  // URLのIDに一致するタスクをSupabaseから取得
  const { data: task, error } = await supabase
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
    .order('id', { foreignTable: 'sub_tasks', ascending: true })
    .eq("id", id)
    .single(); // 単一のレコードを取得

  if (error || !task) {
    return notFound();
  }

  // ログインユーザーがメンバーとして参加しているプロジェクトIDのリストを取得
  const { data: memberProjectIds, error: memberError } = await supabase
    .from('project_members')
    .select('project_id')
    .eq('user_id', user?.id);

  if (memberError) {
    console.error('Error fetching project memberships:', memberError);
    return <div>Error loading project list.</div>;
  }

  // 取得したIDのリストに一致するプロジェクト情報を取得
  const projectIds = memberProjectIds.map(p => p.project_id);
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*')
    .in('id', projectIds);

  if (projectsError) {
    console.error('Error fetching projects:', projectsError);
    return <div>Error loading project list.</div>;
  }

  return (
    <div className="flex flex-col justify-center py-20">
        <h2 className="text-center text-2xl font-bold">Edit Task</h2>
        <EditTaskForm task={task} projects={projects || []}/>
    </div>
  )
};

export default EditTaskPage;