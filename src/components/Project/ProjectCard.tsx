"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaTrash, FaEdit, FaCheck, FaTimes } from "react-icons/fa";
import { deleteProject, updateProjectName } from "@/app/actions";
import { Project } from "@/types";

type ProjectWithOwner = Project & {
    users: {
        name: string;
        icon: string | null;
    } | null;
};

interface ProjectCardProps {
    project: ProjectWithOwner;
    currentUserId: string;
}

const ProjectCard = ({ project, currentUserId }: ProjectCardProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(project.name);
    const [isDeleting, setIsDeleting] = useState(false);

    const isOwner = project.owner === currentUserId;

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault(); // Link遷移を防ぐ
        e.stopPropagation();

        if (!confirm(`プロジェクト "${project.name}" を削除してもよろしいですか？`)) return;

        setIsDeleting(true);
        try {
            await deleteProject(project.id);
        } catch (error) {
            console.error("Failed to delete project", error);
            alert("プロジェクトの削除に失敗しました");
            setIsDeleting(false);
        }
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsEditing(true);
    };

    const handleSave = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (editedName.trim() === "") return;

        try {
            await updateProjectName(project.id, editedName);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update project name", error);
            alert("プロジェクト名の更新に失敗しました");
        }
    };

    const handleCancel = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setEditedName(project.name);
        setIsEditing(false);
    };

    if (isDeleting) {
        return null; // Optimistic removal (or let revalidate handle it)
    }

    return (
        <div className="relative group block p-6 bg-white rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all h-full">
            <Link href={`/projects/${project.id}`} className="absolute inset-0 z-0" />

            <div className="relative z-10 flex items-center gap-4">
                <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                    <Image
                        src={project.users?.icon ?? "/default-avatar.png"}
                        alt={project.users?.name ?? "Owner Avatar"}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-lg object-cover"
                    />
                </div>

                <div className="flex-1 min-w-0">
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full px-2 py-1 text-lg font-semibold border rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                autoFocus
                            />
                            <button
                                onClick={handleSave}
                                className="p-1 text-green-600 hover:bg-green-100 rounded"
                            >
                                <FaCheck />
                            </button>
                            <button
                                onClick={handleCancel}
                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                            >
                                <FaTimes />
                            </button>
                        </div>
                    ) : (
                        <h2 className="text-xl font-semibold truncate" title={project.name}>
                            {project.name}
                        </h2>
                    )}
                </div>
            </div>

            {/* Action Buttons (Only for Owner) */}
            {isOwner && !isEditing && (
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button
                        onClick={handleEditClick}
                        className="p-2 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-full transition-colors"
                        title="Rename Project"
                    >
                        <FaEdit />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete Project"
                    >
                        <FaTrash />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProjectCard;
