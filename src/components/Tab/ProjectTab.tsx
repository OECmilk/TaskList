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
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
            <div className="drawer-ignore-click flex items-center gap-2 p-1 bg-gray-100 rounded-xl ml-0 sm:ml-8 overflow-x-auto w-full sm:max-w-none no-scrollbar scrollbar-hide"
                style={{ WebkitOverflowScrolling: 'touch' }}>
                <button
                    onClick={() => setNowProject(0)}
                    className={`
                        px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap
                        ${nowProject === 0
                            ? 'bg-white text-cyan-700 shadow-sm ring-1 ring-black/5'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                        }
                    `}
                >
                    All
                </button>

                {projects.map((project) => (
                    <button
                        key={project.id}
                        onClick={() => setNowProject(project.id)}
                        className={`
                        px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap max-w-[150px] truncate
                        ${nowProject === project.id
                                ? 'bg-white text-cyan-700 shadow-sm ring-1 ring-black/5'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            }
                    `}
                        title={project.name}
                    >
                        {project.name}
                    </button>
                ))}
            </div>

            {/* Member Icons Area */}
            {nowProject !== 0 && (
                <div className="flex items-center -space-x-2 ml-2 animate-in fade-in slide-in-from-left-4">
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
                                        className="relative w-8 h-8 rounded-full ring-2 ring-white overflow-hidden bg-gray-200 shadow-sm hover:z-10 hover:scale-110 transition-all cursor-help group"
                                    >
                                        <Image
                                            src={member.users.icon || '/default_icon.svg'}
                                            alt={member.users.name}
                                            fill
                                            className="object-cover"
                                        />
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                                            {member.users.name}
                                        </div>
                                    </div>
                                ))}
                                {remainingCount > 0 && (
                                    <div className="relative w-8 h-8 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center shadow-sm z-0">
                                        <span className="text-[10px] font-bold text-gray-500">...</span>
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