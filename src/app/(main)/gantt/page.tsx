import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import GanttChart from "@/components/Gantt/GanttChart";
import { notFound } from "next/navigation";

// ガントチャートで扱うタスクの型を定義
export type GanttTask = {
    id: number; // Server Actionに渡すため、stringからnumberに変更
    name: string;
    start: string;
    end: string;
    project: string | null;
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
            projects ( name )
        `)
        .eq('user_id', user.id)
        .eq('status', false)
        .order('id', { ascending: true });

    if (error) {
        console.error('Error fetching tasks for Gantt chart:', error);
        return <p className="p-8">Error loading tasks.</p>;
    }

    const ganttTasks: GanttTask[] = tasks.map(task => {
        const startDate = new Date(task.start_date);

        return {
            id: task.id, // idを数値型に
            name: task.title,
            start: startDate.toISOString().split('T')[0],
            end: task.due_date,
            project: task.projects?.[0]?.name || null,
        };
    });

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

