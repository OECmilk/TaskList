import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Project } from "@/app/(main)/page";
import { addProjectMember } from "@/app/actions"; 
import Image from "next/image";

// このページで取得する、メンバー情報がネストされたプロジェクトの型を定義
type ProjectWithMembers = Project & {
  project_members: {
    user_id: string;
    // usersテーブルから取得したプロフィール情報
    users: {
      name: string | null;
      icon: string | null;
    } | null;
  }[];
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_members (
        user_id,
        users (
          name,
          icon
        )
      )
    `)
    .eq('id', id)
    .single();

  const project = data as ProjectWithMembers | null;

  if (error || !project) {
    console.error("Error fetching project details:", error);
    notFound();
  }

  return (
    <div className="p-8 sm:p-10 h-full overflow-y-auto text-gray-800">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{project.name}</h1>
        {/* 今後ここにプロジェクトの説明などを表示できます */}
      </header>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-6 border-b pb-4">Members</h2>
        <div className="space-y-4">
          {project.project_members.map((member) => (
            member.users && ( // メンバーのプロフィール情報が存在する場合のみ表示
              <div key={member.user_id} className="flex items-center gap-4">
                {member.users.icon ? (
                  <Image
                    src={member.users.icon}
                    alt={member.users.name || 'User avatar'}
                    width={48} // w-12 -> 48px
                    height={48} // h-12 -> 48px
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                    {member.users.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold">{member.users.name}</p>
                  {/* 今後ここにユーザーのロールなどを表示できます */}
                </div>
              </div>
            )
          ))}
        </div>
        {/* 新しいメンバーを招待するフォーム */}
        <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">Invite New Member</h3>
            <form action={addProjectMember} className="flex flex-col sm:flex-row gap-4">
                <input type="hidden" name="projectId" value={project.id} />
                <div className="flex-grow">
                    <label htmlFor="email" className="sr-only">Email address</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="user@example.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                    />
                </div>
                <button
                    type="submit"
                    className="px-6 py-2 bg-cyan-700 text-white font-semibold rounded-md shadow-sm hover:bg-cyan-600 transition-colors"
                >
                    Invite
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}
