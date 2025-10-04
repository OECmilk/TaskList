"use client";

import NavList from "./NavList/NavList";
import { useState, useEffect } from "react";
import { FaBars } from "react-icons/fa";
import { createClient } from "@/utils/supabase/client";
import { type User } from "@supabase/supabase-js";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Profile = {
  name: string;
  icon: string | null;
};

const SideMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient();
      
      // 1. まず認証ユーザー情報を取得
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // 2. ユーザーが存在する場合、profilesテーブルから対応するプロフィールを取得
      if (user) {
        const { data: profileData, error } = await supabase
          .from('users')
          .select('name, icon')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setProfile(profileData);
        }
      }
    };

    fetchUserData();
  }, []); // 空の配列を渡すことで、初回レンダリング時のみ実行

  // 表示する名前を決定するヘルパー関数
  const getDisplayName = () => {
    if (!profile && !user) return null;
    // 優先順: 1. users.name, 2. email
    return profile?.name || user?.user_metadata.name;
  }

  const pathname = usePathname();

  return (
    <>
    <button
        className={`md:hidden fixed top-3 left-4 z-30 ${isOpen ? "text-white" : "text-gray-800"}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="サイドメニューを開閉する"
      >
        {isOpen ? <></> : <FaBars size={20} />}
      </button>
    <div className={`w-62 pt-8 bg-cyan-900 text-white fixed h-full z-20 transform transition-transform duration-300 ease-in-out 
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:relative md:translate-x-0`}
    >
      <div>
        {/* 下部のユーザー情報 (userが存在する場合のみ表示) */}
        {user && (
          <Link href="/profile" className={`block hover:bg-cyan-800 p-4 transition-colors ${pathname === '/profile' ? 'bg-cyan-900 border-r-5 border-r-orange-200': ''}`}>
            {user.user_metadata.avatar_url && (
              <img 
                  src={user.user_metadata.avatar_url}
                  alt="User Icon"
                  className="w-10 h-10 rounded-full mt-2"
              />
            )}
            <p className="mt-2 mb-2 text-lg font-semibold truncate" title={getDisplayName() || ''}>
                {getDisplayName()}
            </p>
            <div className="p-4 border-t border-orange-100">
            </div>
          </Link>
        )}

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