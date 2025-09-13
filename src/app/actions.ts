'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from "next/headers";

/**
 * タスクを追加するサーバーアクション
 */
export const createNewTask = async (formData: FormData) => {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // フォームからデータを取得
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const dueDate = formData.get('dueDate') as string;

    // Supabaseの'TaskList'テーブルに新しいタスクを挿入
    const { error } = await supabase.from('TaskList').insert([
        {
            title: title,
            description: description,
            due_date: dueDate,
        },
    ]);

    if (error) {
        console.error('Error creating task:', error);
        throw new Error('Failed to create task');
    }

    // データ挿入後のキャッシュをクリアして、一覧ページに最新のリストを表示
    revalidatePath('/');
    redirect('/');
};

/**
 * タスクの完了状態を更新するサーバーアクション
 * @param id 更新するタスクのID
 * @param currentStatus 現在の完了状態 (true/false)
 */
export async function updateTaskStatus(formData: FormData) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    //フォームデータからidとstatusを取得
    const id = formData.get('id') as string;
    const currentStatus = formData.get('status') === 'true'; // 文字列をbooleanに変換

    const { error } = await supabase
        .from('TaskList')
        .update({ status: !currentStatus }) // 現在の状態を反転
        .eq('id', id);

    if (error) {
        console.error('Error updating task status:', error);
        throw new Error('Failed to update task status');
    }

    revalidatePath('/');
}

/**
 * タスクの内容を編集するサーバーアクション
 * @param id 更新するタスクのID
 * @param title タイトル
 * @param description 説明
 * @param due_date 期限
 */
export async function editTask(formData: FormData) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // フォームデータから各フィールドを取得
    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const due_date = formData.get('dueDate') as string;

    const { error } = await supabase
        .from('TaskList')
        .update({
            title: title,
            description: description,
            due_date: due_date,
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
 * @param id 削除するタスクのID
 */
export async function deleteTask(formData: FormData) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const id = formData.get('id') as string;

    const { error } = await supabase
        .from('TaskList')
        .delete()
        .eq('id', id);
    if (error) {
        console.error('Error deleting task:', error);
        throw new Error('Failed to delete task');
    }
    revalidatePath('/');
    redirect('/');
}