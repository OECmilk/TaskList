'use client';

import { GanttTask } from '@/app/(main)/gantt/page';
import { Project } from '@/types';
import { useState, useMemo } from 'react';
import ProjectTab from '@/components/Tab/ProjectTab';
import GanttChart from '@/components/Gantt/GanttChart';
import { MdAddTask } from 'react-icons/md';
import Link from 'next/link';
import MobileGanttChart from './MobileGanttChart'; // Assuming this path is correct relative to GanttContainer

interface GanttContainerProps {
  initialTasks: GanttTask[];
  projects: Project[] | [];
  userId: string;
  initialProjectId: number;
}

const GanttContainer = ({ initialTasks, projects, userId, initialProjectId }: GanttContainerProps) => {
  const [nowProject, setNowProject] = useState<number>(initialProjectId);

  const filteredTasks = useMemo(() => {
    if (nowProject === 0) {
      return initialTasks.filter(task => task.user_id === userId);
    }

    const selectedProjectName = projects.find(p => p.id === nowProject)?.name;
    return initialTasks.filter(task => task.project === selectedProjectName);
  }, [nowProject, initialTasks, projects, userId]);

  // SSRとクライアントでのDate不整合を防ぐため、サーバー側で基準日を生成して渡す
  const baseDate = new Date();

  return (
    <>
      <header className="mb-8 flex justify-between items-start gap-4">
        <div className="flex items-start min-w-0 flex-1 overflow-hidden">
          <ProjectTab
            projects={projects}
            nowProject={nowProject}
            setNowProject={(val) => {
              if (typeof val === 'function') {
                setNowProject((prev) => {
                  const next = val(prev);
                  window.history.replaceState(null, '', `?project=${next}`);
                  return next;
                });
              } else {
                setNowProject(val);
                window.history.replaceState(null, '', `?project=${val}`);
              }
            }}
          />
        </div>

        <Link
          href={`/new?projectId=${nowProject !== 0 ? nowProject : ''}&returnTo=/gantt?project=${nowProject}`}
          prefetch={true}
          className="flex items-center gap-2 px-6 py-2.5 font-bold text-white bg-gradient-to-r from-cyan-600 to-cyan-500 rounded-full shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/40 hover:scale-105 transition-all flex-shrink-0"
        >
          <MdAddTask className="size-5" />
          <div className="hidden sm:inline">Add Task</div>
        </Link>
      </header>

      <div className="bg-white p-2 sm:p-3 rounded-lg shadow-md">
        {filteredTasks.length > 0 ? (
          <>
            <div className="hidden md:block">
              <GanttChart tasks={filteredTasks} baseDate={baseDate} />
            </div>
            <div className="block md:hidden">
              <MobileGanttChart tasks={filteredTasks} baseDate={baseDate} />
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">タスクを追加してみましょう。</p>
          </div>
        )}
      </div>
    </>
  );
};


export default GanttContainer;