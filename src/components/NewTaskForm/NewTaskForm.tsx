"use client";

import { createNewTask } from "@/app/actions";
import { useRouter } from "next/navigation";

const NewTaskForm = () => {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="mt-10 mx-auto w-full max-w-sm">
        <form action={createNewTask}>
            <div>
                <label htmlFor="title" className="block text-sm font-medium">タイトル</label>
                <input type="text" id="title" name="title" required className="block py-1.5 px-2 w-full rounded-md border-0 shadow-sm ring-1 ring-inset ring-gray-300" />
            </div>
            <div className="mt-6">
                <label htmlFor="description" className="block text-sm font-medium">説明</label>
                <input type="text" id="description" name="description" required className="block py-1.5 px-2 w-full rounded-md border-0 shadow-sm ring-1 ring-inset ring-gray-300" />
            </div>
            <div className="mt-6">
                <label htmlFor="dueDate" className="block text-sm font-medium">期限</label>
                <input type="date" id="dueDate" name="dueDate" required 
                min={today} max="2100-12-31"
                className="block py-1.5 px-2 w-full rounded-md border-0 shadow-sm ring-1 ring-inset ring-gray-300" />
            </div>
            <button type="submit" className="mt-8 py-2 w-full rounded-md text-white bg-gray-800 hover:bg-gray-700 text-sm font-semibold shadow-sm">
                Create
            </button>
            <button type="button" onClick={() => router.back()} className="mt-4 py-2 w-full rounded-md text-white bg-red-500 hover:bg-red-400 text-sm font-semibold shadow-sm">
              Cancel
            </button>
        </form>
    </div>
  )
};

export default NewTaskForm;