import { createClient } from "@/utils/supabase/server";
import { Project } from "@/types";
import CreateProjectButton from "@/components/Project/CreateProjectButton";
import Link from "next/link";
import Image from "next/image";

type ProjectWithOwner = Project & {
  users: { // "owner"としてリネームしたusersテーブルのデータ
    name: string;
    icon: string | null;
  } | null;
};

export default async function ProjectsPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <p className="p-8">Please log in to view your projects.</p>;
  }

  // 1. 自分がメンバーになっているプロジェクトIDのリストを取得
  const { data: memberProjectIds, error: memberError } = await supabase
    .from('project_members')
    .select('project_id')
    .eq('user_id', user.id);

  if (memberError) {
    console.error('Error fetching project memberships:', memberError);
    return <p className="p-8">Error loading projects.</p>;
  }

  // 2. 取得したIDのリストに一致するプロジェクト情報と、そのオーナー情報を取得
  const projectIds = memberProjectIds.map(p => p.project_id);
  const { data, error: projectsError } = await supabase
    .from('projects')
    .select(`
      *,
      users (
        name,
        icon
      )
    `)
    .in('id', projectIds);

  const projects = data as ProjectWithOwner[] | null;

  if (projectsError) {
    console.error('Error fetching projects:', projectsError);
    return <p className="p-8">Error loading projects.</p>;
  }

  return (
    <div className="p-8 sm:p-10 h-full overflow-y-auto text-gray-800">
      <header className="flex justify-between items-center mt-2">
        <h1 className="text-2xl font-bold">Projects</h1>
        <CreateProjectButton />
      </header>

      <div className="mt-8">
        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((project) => (
              <Link href={`/projects/${project.id}`} key={project.id} className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Image
                      src={project.users?.icon ?? "/default-avatar.png"}
                      alt={project.users?.name ?? "Owner Avatar"}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-lg"
                    />
                  </div>
                  <h2 className="text-xl font-semibold truncate">{project.name}</h2>
                </div>
                {/* 今後、プロジェクトのオーナーやステータスなどの情報をここに追加できます */}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-6 mt-8 bg-gray-50 rounded-lg border-2 border-dashed">
            <h3 className="text-xl font-semibold text-gray-700">No projects yet</h3>
            <p className="text-gray-500 mt-2">Get started by creating your first project.</p>
          </div>
        )}
      </div>
    </div>
  );
}