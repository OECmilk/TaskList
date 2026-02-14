import NewTaskForm from "@/components/NewTaskForm/NewTaskForm";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

interface NewTaskPageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

const NewTaskPage = async ({ searchParams }: NewTaskPageProps) => {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return notFound();
  }

  const { data: projectMembers, error: projectMembersError } = await supabase
    .from("project_members")
    .select("project_id")
    .eq("user_id", user.id);

  if (projectMembersError) {
    console.error("Error fetching projects:", projectMembersError.message);
  }

  const projectIds = projectMembers?.map(member => member.project_id) || [];

  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("*")
    .in("id", projectIds);

  if (projectsError) {
    console.error("Error fetching projects:", projectsError.message);
  }

  const defaultProjectId = searchParams?.projectId ? String(searchParams.projectId) : undefined;
  const returnTo = searchParams?.returnTo ? String(searchParams.returnTo) : undefined;

  return (
    <div className="flex flex-col justify-center py-20">
      <h2 className="text-center text-2xl font-bold">Create New Task</h2>
      <NewTaskForm
        projects={projects || []}
        defaultProjectId={defaultProjectId}
        returnTo={returnTo}
      />
    </div>
  )
}

export default NewTaskPage;