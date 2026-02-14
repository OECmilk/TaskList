import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Project } from "@/types";
import { addProjectMember } from "@/app/actions";
import Image from "next/image";

type ProjectWithMembers = Project & {
  project_members: {
    user_id: string;
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

  const supabase = createClient();

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
    <div className="p-8 sm:p-10 h-full overflow-y-auto" style={{ color: 'var(--color-text-primary)' }}>
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{project.name}</h1>
      </header>

      <div className="card p-8">
        <h2 className="text-xl font-semibold mb-6 pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>Members</h2>
        <div className="space-y-4">
          {project.project_members.map((member) => (
            member.users && (
              <div key={member.user_id} className="flex items-center gap-4">
                {member.users.icon ? (
                  <Image
                    src={member.users.icon}
                    alt={member.users.name || 'User avatar'}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold" style={{ background: 'var(--color-accent-alpha)', color: 'var(--color-text-secondary)' }}>
                    {member.users.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold">{member.users.name}</p>
                </div>
              </div>
            )
          ))}
        </div>
        {/* 新しいメンバーを招待するフォーム */}
        <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--color-border)' }}>
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
                className="input-field"
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
            >
              Invite
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
