import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import GanttChart from "@/components/Gantt/GanttChart";
import { notFound } from "next/navigation";

// ガントチャートで扱うタスクの型を定義
export type GanttTask = {
    id: number; // Server Actionに渡すため、stringからnumberに変更
    title: string;
    start: string;
    end: string;
    project: string | null;
    name: string;
};

const GanttPage = async () => {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return notFound();
    }

    const { data: tasks, error } = await supabase
        .from('tasks')
        .select(`
            id,
            title,
            start_date,
            due_date,
            users( name ),
            projects!inner (
                name,
                project_members!inner (
                    user_id
                )
            )
        `)
        .eq('status', false)
        .eq('projects.project_members.user_id', user.id)
        .order('id', { ascending: true });

    if (error) {
        console.error('Error fetching tasks for Gantt chart:', error);
        return <p className="p-8">Error loading tasks.</p>;
    }

    console.log("--- Fetched Tasks Data 1 ---");
    console.log(JSON.stringify(tasks, null, 2));

    const ganttTasks: GanttTask[] = tasks.map(task => {
        const startDate = new Date(task.start_date);

        return {
            id: task.id, // idを数値型に
            title: task.title,
            start: startDate.toISOString().split('T')[0],
            end: task.due_date,
            project: task.projects?.[0]?.name || null,
            name: task.users.name,
        };
    });

    console.log("--- Fetched Tasks Data 2 ---");
    console.log(JSON.stringify(ganttTasks, null, 2));

    return (
        <div className="p-8 sm:p-10 h-full overflow-y-auto text-gray-800">
            <header className="mb-8">
                <h1 className="text-2xl font-bold">Gantt Chart</h1>
            </header>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                {ganttTasks.length > 0 ? (
                    <GanttChart tasks={ganttTasks} />
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-500">表示する未完了のタスクがありません。</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GanttPage;

