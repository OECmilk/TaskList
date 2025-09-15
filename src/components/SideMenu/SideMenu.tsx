"use client";

import NavList from "./NavList/NavList";
import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

const SideMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
    <button
        className={`md:hidden fixed top-3 left-4 z-30 ${isOpen ? "text-white" : "text-gray-800"}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="サイドメニューを開閉する"
      >
        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>
    <div className={`w-56 pt-8 bg-gray-800 text-white fixed h-full z-20 transform transition-transform duration-300 ease-in-out 
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:relative md:translate-x-0`}
    >
      <div>
          <h1 className="px-4 text-2xl font-bold">Your Tasks</h1>
          <NavList />
      </div>
    </div>
    {isOpen && (
      <div
        className="md:hidden fixed inset-0 bg-black opacity-50 z-10"
        onClick={() => setIsOpen(false)}
      ></div>
      )}
    </>
  ) ;
};

export default SideMenu;