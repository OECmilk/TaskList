import { UUID } from "crypto";

// subTaskの型を定義
export type SubTask = {
    id: number;
    task_id: number;
    title: string;
    description: string | null;
    status: boolean;
};

// Projectの型を定義
export type Project = {
    id: number;
    name: string;
    owner: string;
    status: boolean;
    project_members?: {
        user_id: string;
        users: {
            id: string;
            name: string;
            icon: string | null;
        }
    }[];
};

// Task status type definition
export type TaskStatus = '未着手' | '処理中' | '保留' | '完了';

// Taskの型定義
export type Task = {
    id: number;
    title: string;
    description: string | null;
    status: TaskStatus;
    due_date: string;
    start_date?: string;
    user_id: string; // Changed UUID to string for simplicity if needed, or keep UUID
    project_id: number | null;
    sub_tasks?: SubTask[];
    projects?: Project;
};
