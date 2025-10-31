import { createClient } from "@/utils/supabase/server";
import GanttChart from "@/components/Gantt/GanttChart";
import { notFound } from "next/navigation";
import ProjectTab from "@/components/Tab/ProjectTab";
import { Project } from "../page";
import GanttContainer from "@/components/Gantt/GanttContainer";

// ガントチャートで扱うタスクの型を定義
export type GanttTask = {
    id: number; // Server Actionに渡すため、stringからnumberに変更
    title: string;
    start: string;
    end: string;
    user_id: string;
    user_name: string;
    project: string | null;
    project_members: {
        user_id: string;
        user_name: string;
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
                name: string;
            }
        }[];
    } | null;
    users: {
        name: string;
    };
};

const GanttPage = async () => {
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

    const { data,  error } = await supabase
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
                    users( name )
                    )
                ),
            users( name )
        `)
        .eq('status', false)
        .in('project_id', projectIds)
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
            const { project_members, ...projectData } = task.projects;
            projectsMap.set(projectData.id, projectData as Project);
        }
    });
    const projectsForTab: Project[] = Array.from(projectsMap.values());

    // ガントチャート用のデータを抽出
    const ganttTasks: GanttTask[] = tasks.map(task => {
            const startDate = new Date(task.start_date);

            const members = task.projects?.project_members.map(mamber => ({
                user_id: mamber.user_id,
                user_name: mamber.users.name,
            })) || [];
    
            return {
                id: task.id, // idを数値型に
                title: task.title,
                start: startDate.toISOString().split('T')[0],
                end: task.due_date,
                user_id: task.user_id,
                user_name: task.users.name,
                project: task.projects?.name || null,
                project_members: members,
            };
        });

    return (
        <div className="p-8 sm:p-10 h-full overflow-y-auto text-gray-800">
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

            <GanttContainer initialTasks={ganttTasks} projects={projectsForTab} />
        </div>
    );
};

export default GanttPage;

