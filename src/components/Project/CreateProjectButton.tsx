'use client';

import { useState } from 'react';
import { MdAdd } from 'react-icons/md';
import { createProject } from '@/app/actions';

const CreateProjectButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const createProjectAction = async (formData: FormData) => {
    await createProject(formData);
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="btn-primary flex items-center gap-2 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all"
      >
        <MdAdd size={20} />
        <span className="hidden sm:inline">New Project</span>
      </button>

      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 flex justify-center items-center z-50"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card p-8 w-full max-w-md mx-4"
          >
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>Create a New Project</h2>
            <form action={createProjectAction}>
              <div className="space-y-1.5">
                <label htmlFor="projectName" className="block text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                  Project Name
                </label>
                <input
                  type="text"
                  id="projectName"
                  name="projectName"
                  required
                  className="input-field"
                />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateProjectButton;
