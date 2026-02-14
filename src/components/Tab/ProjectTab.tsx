'use client';

import { Project } from '@/types';
import Image from 'next/image';
import { Dispatch, SetStateAction } from 'react';

interface ProjectTabProps {
    projects: Project[];
    nowProject: number;
    setNowProject: Dispatch<SetStateAction<number>>;
}

const ProjectTab = ({ projects, nowProject, setNowProject }: ProjectTabProps) => {

    return (
        <div className="flex flex-col w-full gap-2">
            <div className="drawer-ignore-click flex items-center gap-1.5 p-1 rounded-xl ml-0 sm:ml-8 overflow-x-auto w-full sm:max-w-none no-scrollbar"
                style={{ background: 'var(--color-accent-alpha)' }}>
                <button
                    onClick={() => setNowProject(0)}
                    className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap hover:opacity-70 cursor-pointer"
                    style={{
                        background: nowProject === 0 ? 'var(--color-card)' : 'transparent',
                        color: nowProject === 0 ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                        boxShadow: nowProject === 0 ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    }}
                >
                    自分のタスク
                </button>

                {projects.map((project) => (
                    <button
                        key={project.id}
                        onClick={() => setNowProject(project.id)}
                        className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap hover:opacity-70 cursor-pointer"
                        style={{
                            background: nowProject === project.id ? 'var(--color-card)' : 'transparent',
                            color: nowProject === project.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                            boxShadow: nowProject === project.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        }}
                    >
                        {project.name}
                    </button>
                ))}
            </div>

            {/* Member Icons Area */}
            {nowProject !== 0 && (
                <div className="flex items-center -space-x-2 ml-0 sm:ml-8 animate-in fade-in slide-in-from-left-4">
                    {(() => {
                        const currentProject = projects.find(p => p.id === nowProject);
                        if (!currentProject?.project_members || currentProject.project_members.length === 0) return null;

                        const displayMembers = currentProject.project_members.slice(0, 5);
                        const remainingCount = currentProject.project_members.length - 5;

                        return (
                            <>
                                {displayMembers.map((member) => (
                                    <div
                                        key={member.user_id}
                                        className="relative w-8 h-8 rounded-full ring-2 ring-white overflow-hidden shadow-sm hover:z-10 hover:scale-110 transition-all cursor-help group"
                                        style={{ background: 'var(--color-surface)' }}
                                    >
                                        <Image
                                            src={member.users.icon || '/default_icon.svg'}
                                            alt={member.users.name}
                                            fill
                                            className="object-cover"
                                        />
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20"
                                            style={{ background: 'var(--color-ink)', color: 'var(--color-surface)' }}>
                                            {member.users.name}
                                        </div>
                                    </div>
                                ))}
                                {remainingCount > 0 && (
                                    <div className="relative w-8 h-8 rounded-full ring-2 ring-white flex items-center justify-center shadow-sm z-0"
                                        style={{ background: 'var(--color-surface)' }}>
                                        <span className="text-[10px] font-bold" style={{ color: 'var(--color-text-muted)' }}>...</span>
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </div>
            )}
        </div>
    );
}
export default ProjectTab;