import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { FaEdit } from "react-icons/fa";
import RouterBackButton from "@/components/Button/RouterBackButton";
import Chat, { ChatMessage} from "@/components/Chat/Chat";
import SubTasks from "@/components/Drawer/SubTasks";
import TaskCompleteButton from "@/components/Button/TaskCompleteButton";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// これは、右側からスライドインする「ドロワー」コンポーネントです
const TaskDetailDrawer = async ({ params, searchParams }: PageProps) => {
  const { id } = await params;
  const returnPath = ((await searchParams).returnPath as string) || '/';

  const supabase = createClient();


  //  スライドイン画面も、自身でデータを取得
  const { data: task, error } = await supabase
    .from("tasks")
    .select(
      `
        *,
        sub_tasks ( * ),
        projects ( name ),
        chats (
          id,
          created_at,
          message,
          user_id,
          users ( name, icon ) 
        )
      `
    )
    .eq("id", id)
    .single();

  if (error || !task) {
    notFound();
  }

  // 取得したチャット履歴を initialMessages に渡す
  const initialMessages = (task.chats as ChatMessage[]) || [];

  return (
    <>
      {/*  スライドインするパネル本体 */}
      <div 
        className="fixed top-0 right-0 w-full max-w-3xl h-full bg-white shadow-xl z-40 overflow-y-auto animate-slideInFromRight"
        >
        <div className="p-8 sm:p-10 text-gray-800">
          
          {/*  ヘッダー（閉じるボタンと編集ボタン） */}
          <header className="flex justify-between items-center mb-4 mt-2">
            <RouterBackButton returnPath={returnPath}/>
            <a 
              href={`/edit/${task.id}`} 
              className="flex items-center gap-1 px-4 py-2 font-semibold text-white bg-cyan-700 rounded-full shadow-sm hover:bg-cyan-600"
            >
              <FaEdit className="size-5"/>
              <div className="hidden sm:inline">Edit Task</div>
            </a>
          </header>

          {/*  詳細コンテンツ */}
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">
                {task.projects?.name || ""}
              </p>
              <h1 className="text-xl font-bold">{task.title}</h1>
            </div>
            <TaskCompleteButton id={ task.id } status={ task.status } size="4xl"/>
          </div>

          {/* タスクエリア */}
          <div className="mt-4 bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="mb-8">{task.description || "No description."}</p>
          </div>

          {/* サブタスクエリア */}
          <div className="mt-4 bg-gray-50 p-6 rounded-lg">
            <SubTasks sub_tasks={task.sub_tasks || []} />
          </div>

          {/* チャットエリア */}
          <Chat taskId={task.id} initialMessages={initialMessages} />
        </div>
      </div>
    </>
  );
};

export default TaskDetailDrawer;
