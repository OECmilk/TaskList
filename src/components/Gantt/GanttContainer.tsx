'use client';

import { GanttTask } from '@/app/(main)/gantt/page';
import { Project } from '@/app/(main)/page';
import { useState, useMemo } from 'react';
import ProjectTab from '@/components/Tab/ProjectTab';
import GanttChart from '@/components/Gantt/GanttChart';

interface GanttContainerProps {
    initialTasks: GanttTask[];
    projects: Project[] | [];
}

const GanttContainer = ({ initialTasks, projects }: GanttContainerProps ) => {
    const [nowProject, setNowProject] = useState<number>(0);

    const filteredTasks = useMemo(() => {
    if (nowProject === 0) {
      return initialTasks;
    }

    const selectedProjectName = projects.find(p => p.id === nowProject)?.name;
    return initialTasks.filter(task => task.project === selectedProjectName);
  }, [nowProject, initialTasks, projects]);

    return (
        <>
      <header className="mb-8 flex items-center">
        <h1 className="text-2xl font-bold">Gantt Chart</h1>

        <ProjectTab 
          projects={projects} 
          nowProject={nowProject} 
          setNowProject={setNowProject} 
        />
      </header>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        {filteredTasks.length > 0 ? (
          <GanttChart tasks={filteredTasks} />
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">表示する未完了のタスクがありません。</p>
          </div>
        )}
      </div>
    </>
  );
};

export default GanttContainer;