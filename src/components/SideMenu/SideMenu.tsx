"use client";

import NavList from "./NavList/NavList";
import { useState, useEffect } from "react";
import { FaBars } from "react-icons/fa";
import { createClient } from "@/utils/supabase/client";
import { type User } from "@supabase/supabase-js";
import Link from "next/link";

const SideMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const [user, setUser] = useState<User | null>(null);

  // コンポーネントのマウント時にユーザー情報を取得する
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    fetchUser();
  }, []); // 空の配列を渡すことで、初回レンダリング時のみ実行

  return (
    <>
    <button
        className={`md:hidden fixed top-3 left-4 z-30 ${isOpen ? "text-white" : "text-gray-800"}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="サイドメニューを開閉する"
      >
        {isOpen ? <></> : <FaBars size={20} />}
      </button>
    <div className={`w-56 pt-8 bg-gray-800 text-white fixed h-full z-20 transform transition-transform duration-300 ease-in-out 
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:relative md:translate-x-0`}
    >
      <div>
          <h1 className="px-4 text-2xl font-bold">Your Tasks</h1>

          {/* 下部のユーザー情報 (userが存在する場合のみ表示) */}
            {user && (
                <div className="p-4 border-t border-gray-700">
                    <Link href="/profile" className="block hover:bg-gray-700 rounded-md p-2 transition-colors">
                        <p className="text-sm font-medium">Signed in as</p>
                        <p className="text-sm font-semibold truncate" title={user.email || ''}>
                            {user.email}
                        </p>
                    </Link>
                </div>
            )}
            {!user && (<div>ログイン出来てないで</div>)}

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