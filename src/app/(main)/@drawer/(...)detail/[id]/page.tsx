import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { ChatMessage } from "@/components/Chat/Chat";
import DrawerContent from "./DrawerContent";

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
        projects ( 
          name,
          project_members ( 
            user_id,
            users ( id, name, icon ) 
          )
        ),
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
    <DrawerContent task={task} initialMessages={initialMessages} returnPath={returnPath} />
  );
};

export default TaskDetailDrawer;
