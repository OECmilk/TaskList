'use client';

import { useState } from 'react';
import { MdAdd } from 'react-icons/md';
import { createProject } from '@/app/actions';

const CreateProjectButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // フォーム送信後にモーダルを閉じるためのラッパーアクション
  const createProjectAction = async (formData: FormData) => {
    await createProject(formData);
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-cyan-700 text-white font-semibold rounded-full shadow-md hover:bg-cyan-600 transition-colors"
      >
        <MdAdd size={20} />
        <span className="hidden sm:inline">New Project</span>
      </button>

      {isModalOpen && (
        <div 
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 bg-black/60 flex justify-center items-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md mx-4"
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Create a New Project</h2>
            <form action={createProjectAction}>
              <div className="mb-4">
                <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  id="projectName"
                  name="projectName"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 rounded-md text-gray-800 bg-gray-200 hover:bg-gray-300 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-md text-white bg-cyan-700 hover:bg-cyan-600 font-semibold transition-colors"
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
