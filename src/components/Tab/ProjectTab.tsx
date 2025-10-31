'use client';

import { Project } from '@/app/(main)/page';
import { Dispatch, SetStateAction } from 'react';

interface ProjectTabProps {
  projects: Project[];
  nowProject: number;
  setNowProject: Dispatch<SetStateAction<number>>;
}

const ProjectTab = ({ projects, nowProject, setNowProject }: ProjectTabProps) => {

    return (
        <div className="flex ml-8 text-gray-600 font-medium cursor-pointer rounded-lg shadow-sm text-center">
            <div 
                onClick={() => setNowProject(0)} 
                className={`px-4 py-1 rounded-l-lg text-gray-600 ${nowProject === 0 ? 'bg-orange-100' : 'hover:bg-gray-200'}`}
            >
                All
            </div>

            {projects.map((project) => (
                <div 
                    key={project.id}
                    onClick={() => setNowProject(project.id)}
                    className={`px-4 py-1 border-l text-gray-600 w-30 truncate last:rounded-r-lg ${nowProject === project.id ? 'bg-orange-100' : 'hover:bg-gray-200'}`}
                >
                    {project.name}
                </div>
            ))}
        </div>
    );
}
export default ProjectTab;