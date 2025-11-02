'use client';

import { GanttTask } from '@/app/(main)/gantt/page';
import { Project } from '@/app/(main)/page';
import { useState, useMemo } from 'react';
import ProjectTab from '@/components/Tab/ProjectTab';
import GanttChart from '@/components/Gantt/GanttChart';
import { MdAddTask } from 'react-icons/md';
import Link from 'next/link';

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
      <header className="mb-8 flex justify-between items-center">
        <div className="flex">
          <h1 className="text-2xl font-bold">Gantt Chart</h1>
          <ProjectTab 
            projects={projects} 
            nowProject={nowProject} 
            setNowProject={setNowProject} 
          />
        </div>

        <Link href="/new" prefetch={true} className="flex items-center gap-1 px-4 py-2 font-semibold text-white rounded-full shadow-sm bg-cyan-700 hover:bg-cyan-600">
          <MdAddTask className="size-5"/>
          <div className="hidden sm:inline">Add Task</div>
        </Link>
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