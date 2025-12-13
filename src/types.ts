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
            name: string;
            icon: string | null;
        }
    }[];
};

// Taskの型定義
export type Task = {
    id: number;
    title: string;
    description: string | null;
    status: boolean;
    due_date: string;
    user_id: UUID;
    project_id: number | null;
    sub_tasks?: SubTask[];
    projects?: Project;
};
