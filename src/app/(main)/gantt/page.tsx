import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Project } from "@/types";
import GanttContainer from "@/components/Gantt/GanttContainer";

// ガントチャートで扱うタスクの型を定義
export type GanttTask = {
    id: number; // Server Actionに渡すため、stringからnumberに変更
    title: string;
    start: string;
    end: string;
    user_id: string;
    user_name: string;
    user_icon: string | null;
    project: string | null;
    project_members: {
        user_id: string;
        user_name: string;
        user_icon: string | null;
    }[] | null;
};

// Supabaseから返ってくるデータの形を定義
type TaskForGantt = {
    id: number;
    title: string;
    start_date: string;
    due_date: string;
    user_id: string;
    projects: {
        id: number;
        name: string;
        owner: string;
        status: boolean;
        project_members: {
            user_id: string;
            users: {
                id: string;
                name: string;
                icon: string | null;
            }
        }[];
    } | null;
    users: {
        name: string;
        icon: string | null;
    };
};

interface GanttPageProps {
    searchParams?: { [key: string]: string | string[] | undefined };
}

const GanttPage = async ({ searchParams }: GanttPageProps) => {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return notFound();
    }

    // ログインユーザーがメンバーとして参加しているプロジェクトIDのリストを取得
    const { data: projectMembers, error: memberError } = await supabase
        .from('project_members')
        .select('project_id')
        .eq('user_id', user.id);

    if (memberError) {
        console.error('Error fetching project members:', memberError);
        return <p className="p-8">Error loading projects.</p>;
    }

    const projectIds = projectMembers.map(member => member.project_id);

    // 自分のタスク or 所属するプロジェクトのタスク
    const orFilter = `user_id.eq.${user.id}${projectIds.length > 0 ? `,project_id.in.(${projectIds.join(',')})` : ''}`;
    const { data, error } = await supabase
        .from('tasks')
        .select(`
            id,
            title,
            start_date,
            due_date,
            user_id,
            projects( 
                id,
                name,
                owner,
                status,
                project_members( 
                    user_id,
                    users( id, name, icon )
                    )
                ),
            users( name, icon )
        `)
        .eq('status', false)
        // .in('project_id', projectIds)
        .or(orFilter)
        .order('id', { ascending: true });

    if (error) {
        console.error('Error fetching tasks for Gantt chart:', error);
        return <p className="p-8">Error loading tasks.</p>;
    }

    // 取得したデータに型アサーションを適用
    const tasks = data as unknown as TaskForGantt[];

    // プロジェクトタブ用のデータを抽出
    const projectsMap = new Map<number, Project>();
    tasks.forEach(task => {
        if (task.projects) {
            // ここで project_members を除外せず、そのまま Project 型として扱う
            // Supabaseの型とLocalのProject型定義の整合性をとるため、キャストを使用
            // または、型定義に合わせてマッピングする
            const projectData = {
                id: task.projects.id,
                name: task.projects.name,
                owner: task.projects.owner,
                status: task.projects.status,
                project_members: task.projects.project_members.map(m => ({
                    user_id: m.user_id,
                    users: {
                        id: m.users.id,
                        name: m.users.name,
                        icon: m.users.icon
                    }
                }))
            };
            projectsMap.set(projectData.id, projectData);
        }
    });
    const projectsForTab: Project[] = Array.from(projectsMap.values());

    // ガントチャート用のデータを抽出
    const ganttTasks: GanttTask[] = tasks.map(task => {
        const startDate = new Date(task.start_date);

        const members = task.projects?.project_members.map(mamber => ({
            user_id: mamber.user_id,
            user_name: mamber.users.name,
            user_icon: mamber.users.icon,
        })) || [];

        return {
            id: task.id, // idを数値型に
            title: task.title,
            start: startDate.toISOString().split('T')[0],
            end: task.due_date,
            user_id: task.user_id,
            user_name: task.users.name,
            user_icon: task.users.icon,
            project: task.projects?.name || null,
            project_members: members,
        };
    });

    return (
        <div className="p-4 sm:p-6 h-full overflow-y-auto text-gray-800">
            {/* <header className="mb-8 flex">
                <h1 className="text-2xl font-bold">Gantt Chart</h1>
                <ProjectTab projects={projectsForTab || []} />
            </header>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                {ganttTasks.length > 0 ? (
                    <GanttChart tasks={ganttTasks} />
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-500">表示する未完了のタスクがありません。</p>
                    </div>
                )}
            </div> */}

            <GanttContainer
                initialTasks={ganttTasks}
                projects={projectsForTab}
                userId={user.id}
                initialProjectId={searchParams?.project ? Number(searchParams.project) : 0}
            />
        </div>
    );
};

export default GanttPage;

