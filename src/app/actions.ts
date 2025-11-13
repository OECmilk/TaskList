'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * タスクを追加するサーバーアクション
 */
export const createNewTask = async (formData: FormData) => {
    const supabase = createClient();

    // フォームからデータを取得
    const title = formData.get('title') as string;
    const description = formData.get('description') as string || null;
    const dueDate = formData.get('dueDate') as string; // 入力が無い場合、自動で今日を設定
    const projectIdString = formData.get('projectId') as string;
    const projectId = projectIdString ? parseInt(projectIdString, 10) : null;

    // Supabaseの'TaskList'テーブルに新しいタスクを挿入
    const { error } = await supabase.from('tasks').insert([
        {
            title: title,
            description: description,
            due_date: dueDate,
            project_id: projectId,
        },
    ]);

    if (error) {
        console.error('Error creating task:', error);
        throw new Error('Failed to create task');
    }

    // データ挿入後のキャッシュをクリアして、一覧ページに最新のリストを表示
    revalidatePath("/gantt");
    redirect("/gantt");
};

/**
 * 新しいサブタスクを追加するサーバーアクション
 */
export async function addSubTask(formData: FormData) {
    const supabase = createClient();

    // フォームからデータを取得
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const taskId = formData.get('task_id') as string;

    // sub_tasksテーブルに新しいレコードを挿入
    const { error } = await supabase.from('sub_tasks').insert([
        {
            title: title,
            description: description,
            task_id: taskId,
            status: false // サブタスクの初期状態は未完了
        },
    ]);

    if (error) {
        console.error('Error creating subtask:', error);
        throw new Error('Failed to create subtask');
    }

    // データ更新後、キャッシュをクリアして編集ページを再描画する
    revalidatePath(`/edit/${taskId}`);
}

/**
 * タスクの完了状態を更新するサーバーアクション
 */
export async function updateTaskStatus(formData: FormData) {
    const supabase = createClient();

    //フォームデータからidとstatusを取得
    const id = formData.get('id') as string;
    const currentStatus = formData.get('status') === 'true'; // 文字列をbooleanに変換

    const { error } = await supabase
        .from('tasks')
        .update({ status: !currentStatus }) // 現在の状態を反転
        .eq('id', id);

    if (error) {
        console.error('Error updating task status:', error);
        throw new Error('Failed to update task status');
    }

    revalidatePath('/gantt');
}

/**
 * サブタスクの完了状態を更新するサーバーアクション
 */
export async function updateSubTaskStatus(id: number, taskId: number, currentStatus: boolean) {
    const supabase = createClient();

    const { error } = await supabase
        .from('sub_tasks')
        .update({ status: !currentStatus }) // 現在の状態を反転
        .eq('id', id)
        .eq('task_id', taskId);

    if (error) {
        console.error('Error updating task status:', error);
        throw new Error('Failed to update sub_task status');
    }

    revalidatePath(`/edit/${taskId}`);
}

/**
 * タスクの内容を編集するサーバーアクション
 * @param id 更新するタスクのID
 * @param title タイトル
 * @param description 説明
 * @param due_date 期限
 * @param project_id
 */
export async function editTask(formData: FormData) {
    const supabase = createClient();

    // フォームデータから各フィールドを取得
    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const due_date = formData.get('dueDate') as string;
    const projectIdString = formData.get('projectId') as string;

    const project_id = projectIdString ? parseInt(projectIdString, 10) : null;

    const { error } = await supabase
        .from('tasks')
        .update({
            title: title,
            description: description,
            due_date: due_date,
            project_id: project_id, 
        })
        .eq('id', id);

    if (error) {
        console.error('Error editing task:', error);
        throw new Error('Failed to edit task');
    }

    revalidatePath('/');
    redirect('/');
}

/**
 * タスクを削除するサーバーアクション
 * @param id 削除するサブタスクのID
 */
export async function deleteTask(formData: FormData) {
    const supabase = createClient();
    
    const id = formData.get('id') as string;

    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
    if (error) {
        console.error('Error deleting task:', error);
        throw new Error('Failed to delete task');
    }
    revalidatePath('/');
    redirect('/');
}

/**
 * サブタスクを削除するサーバーアクション
 * @param id 削除するタスクのID
 * @param taskId 削除するタスクのID
 */
export async function deleteSubTask(id: number, taskId: number) {
    const supabase = createClient();

    const { error } = await supabase
        .from('sub_tasks')
        .delete()
        .eq('id', id);
    if (error) {
        console.error('Error deleting task:', error);
        throw new Error('Failed to delete task');
    }
    
    revalidatePath(`/edit/${taskId}`);
}


/**
 * ガントチャートのドラッグ操作によってタスクの開始日と終了日を更新する
 */
export async function updateTaskDates(
  taskId: number,
  newStartDate: string,
  newEndDate: string
) {
  const supabase = createClient();

  const { error } = await supabase
    .from('tasks')
    .update({ 
      start_date: newStartDate, 
      due_date: newEndDate 
    })
    .eq('id', taskId);

  if (error) {
    console.error('Error updating task dates:', error);
    // エラーを投げて、クライアント側で捕捉できるようにする
    throw new Error('Failed to update task dates.');
  }

  // ガントチャートページのキャッシュをクリアして再描画をトリガー
  revalidatePath('/gantt');
}


/**
 * 新しいプロジェクトを作成するサーバーアクション
 */
export async function createProject(formData: FormData) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User is not authenticated');
  }

  const name = formData.get('projectName') as string;

  // projectsテーブルに新しいレコードを挿入し、その結果を受け取る
  const { data: newProject, error: projectError } = await supabase
    .from('projects')
    .insert([
      {
        name: name,
        owner: user.id,
        status: false,
      },
    ])
    .select() // 挿入したレコードを返してもらう
    .single(); // 1件だけ取得

  if (projectError || !newProject) {
    console.error('Error creating project:', projectError);
    throw new Error('Failed to create project');
  }

  // 2. 次に、作成したプロジェクトのIDとオーナーのIDをproject_membersテーブルに挿入します
  const { error: memberError } = await supabase
    .from('project_members')
    .insert([
      {
        project_id: newProject.id,
        user_id: user.id,
      },
    ]);

  if (memberError) {
    console.error('Error adding project owner to members:', memberError);
    // ここで、作成したプロジェクトを削除するなどのロールバック処理を追加することも可能です
    throw new Error('Failed to add owner to project members');
  }

  revalidatePath('/projects');
}

/**
 * プロジェクトに新しいメンバーを追加するサーバーアクション
 */
export async function addProjectMember(formData: FormData) {
  const supabase = createClient();

  const projectId = formData.get('projectId') as string;
  const email = formData.get('email') as string;

  if (!projectId || !email) {
    throw new Error('Project ID and email are required.');
  }

  // 1. RPCを呼び出して、emailからuser_idを取得
  const { data: userId, error: rpcError } = await supabase.rpc('get_user_id_by_email', {
    email_address: email,
  });

  if (rpcError || !userId) {
    console.error('Error finding user by email:', rpcError);
    // TODO: エラーメッセージをユーザーに表示する
    return;
  }

  // 2. project_membersテーブルに新しいレコードを挿入
  const { error: insertError } = await supabase.from('project_members').insert({
    project_id: projectId,
    user_id: userId,
  });

  if (insertError) {
    // ユーザーが既にメンバーである場合のエラー(unique constraint violation)は無視する
    if (insertError.code === '23505') {
      console.log('User is already a member.');
    } else {
      console.error('Error adding project member:', insertError);
      throw new Error('Failed to add member to the project.');
    }
  }

  revalidatePath(`/projects/${projectId}`);
}

/**
 * お問い合わせフォームを送信するサーバーアクション
 */
export async function submitContactForm(formData: FormData) {
  const supabase = createClient();

  const message = formData.get('message') as string;

  const { error } = await supabase.from('contacts').insert({
    message: message,
  });

  if (error) {
    console.error('Error submitting contact form:', error);
    const errorMessage = encodeURIComponent('Failed to send message. Please try again.');
    return redirect(`/contact?error=${errorMessage}`);
  }

  // 成功したら感謝のメッセージを表示
  const successMessage = encodeURIComponent('Thank you!');
  redirect(`/contact?message=${successMessage}`);
}

/**
 * プロフィール情報を更新するサーバアクション
 */
export async function updateProfile(formData: FormData) {
  const supabase = createClient();

  // ログインしているユーザー情報を取得
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const message = encodeURIComponent('You must be logged in to update your profile.');
    return redirect(`/auth/login?message=${message}`);
  }

  // フォームから更新後の値を取得
  const userName = formData.get('userName') as string;
  const email = formData.get('email') as string;
  const iconFile = formData.get('icon') as File;

  let newIconUrl: string | null = null;

  // 新しいアイコンファイルがアップロードされた場合のみ、Supabaseストレージに保存
  if (iconFile && iconFile.size > 0) {
    const fileExt = iconFile.name.split('.').pop(); // 拡張子だけを取得
    const filePath = `${user.id}/${Date.now()}.${fileExt}`; // ファイル名を作成（日本語などを避けるため）

    const { error: uploadError } = await supabase.storage
      .from('icons')
      .upload(filePath, iconFile, { upsert: true });

    if (uploadError) {
      console.error('Icon upload error:', uploadError.message);
      const message = encodeURIComponent('Failed to upload icon.');
      return redirect(`/profile?message=${message}`);
    }

    // アップロードしたファイルの公開URLを取得
    const { data: { publicUrl }} = supabase.storage
      .from('icons')
      .getPublicUrl(filePath);

    newIconUrl = publicUrl;
  }

  // public.usersの更新するカラムを決定
  const updates: {name: string, icon?: string} = {
    name: userName,
  };
  if (newIconUrl) {
    updates.icon = newIconUrl;
  }

  // 更新
  const { error: profileError } = await supabase
  .from('users')
  .update(updates)
  .eq('id', user.id);
  if (profileError) {
    console.error('Profile update error:', profileError.message);
    const message = encodeURIComponent('Failed to update profile name.');
    return redirect(`/profile/edit?message=${message}`);
  }

  if (email !== user.email) {
    const { error: authError} = await supabase.auth.updateUser({
      email: email,
    });
    if (authError) {
      console.error('Auth update error:', authError.message);
      const message = encodeURIComponent('Failed to update email. It may already be in use.');
      return redirect(`/profile/edit?message=${message}`);
    }
  }

  revalidatePath('/profile');
  redirect('/profile');
}


/**
 * タスクの担当者を更新するサーバーアクション
 */
export async function updateTaskUser(taskId: number, userId: string) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User is not authenticated');
  }

  const { error } = await supabase
    .from('tasks')
    .update({ user_id: userId })
    .eq('id', taskId);

  if (error) {
    console.error('Error updating task user:', error);
    throw new Error('Failed to update task user.');
  }

  // 自分以外の場合通知を作成
  if (user.id !== userId) {
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        from_user_id: user.id,
        to_user_id: userId,
        task_id: taskId,
        action_type: 'TASK_ASSIGNED'
      });
    
    if (notificationError) {
      // 通知の失敗はコンソールに出力するが、メインの処理は続行
      console.error('Error creating task assignment notification:', notificationError);
    }
  }

  revalidatePath('/gantt');
  revalidatePath('/');
}

/**
* チャットメッセージを送信するサーバーアクション
*/
export async function sendChatMessage(formData: FormData) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User is not authenticated');
  }
  
  const taskId = formData.get('taskId') as string;
  const message = formData.get('message') as string;
  if (!taskId || !message) {
    throw new Error('Task ID and message are required.');
  }

  const { error } = await supabase.from('chats').insert([
    {
      message: message,
      task_id: parseInt(taskId, 10),
      user_id: user.id,
    },
  ]);
  if (error) {
    console.error('Error sending chat message:', error);
    throw new Error('Failed to send chat message');
  }

  // メンション(@)があれば通知を作成
  const mentionRegex = /@([^@\s]+)/g;
  const mentionedNames = (message.match(mentionRegex) || []).map(mention => mention.substring(1));

  //　デバッグ
  console.log('Mention Regex: ', mentionRegex);
  console.log('Mentioned names:', mentionedNames);

  if (mentionedNames.length > 0) {
    //  メンションされたユーザー名からユーザーIDを取得
    const { data: mentionedUsers, error: usersError } = await supabase
      .from('users')
      .select('id, name')
      .in('name', mentionedNames);

    if (usersError) {
      console.error('Error fetching mentioned users:', usersError);
    } else if (mentionedUsers && mentionedUsers.length > 0) {
      //  通知データを作成
      const notifications = mentionedUsers
        .filter(mentionedUser => mentionedUser.id !== user.id) // 自分自身へのメンションは通知しない
        .map(mentionedUser => ({
          from_user_id: user.id,
          to_user_id: mentionedUser.id,
          task_id: parseInt(taskId, 10),
          action_type: 'CHAT_MENTION'
        }));

      if (notifications.length > 0) {
        // notificationsテーブルに挿入
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert(notifications);

        if (notificationError) {
          console.error('Error creating mention notifications:', notificationError);
        }
      }
    }
  }

  revalidatePath(`/detail/${taskId}`);
}


/* 通知を既読にするサーバーアクション */
export async function updateIsRead(notificationId: number) {
  const supabase = createClient();

  const { error } = await supabase
  .from('notifications')
  .update({ is_read: true })
  .eq('id', notificationId);

  if (error) {
  console.error('Error updating notifications is_read:', error);
  throw new Error('Failed to update notification is_read');
  }
}