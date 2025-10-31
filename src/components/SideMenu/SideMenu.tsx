"use client";

import NavList from "./NavList/NavList";
import { useState, useEffect } from "react";
import { FaBars } from "react-icons/fa";
import { createClient } from "@/utils/supabase/client";
import { type User } from "@supabase/supabase-js";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useProfile } from "@/contexts/ProfileContext";


const SideMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const { profile, setProfile } = useProfile();

  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient();
      
      // まず認証ユーザー情報を取得
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // ユーザーが存在する場合、profilesテーブルから対応するプロフィールを取得
      if (user) {
        const { data: profileData, error } = await supabase
          .from('users')
          .select('name, icon')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else if (profileData) {
          setProfile({ id: user.id ,...profileData, email: user.email || '' });
        }
      }
    };

    // まだプロフィールが読み込まれていない場合のみデータを取得
    if (!profile) {
      fetchUserData();
    }
  }, [profile, setProfile]); // profileが変更されたときにも再評価

  // 表示する名前を決定するヘルパー関数
  const getDisplayName = () => {
    if (!user) return null;
    // 優先順: 1. users.name, 2. email
    return profile?.name || user.email;
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
        {/* userと、Contextから取得したprofileを使ってUIを構築 */}
        {user && profile && (
          <Link href="/profile" className={`block hover:bg-cyan-800 p-4 transition-colors ${pathname === '/profile' ? 'bg-cyan-900 border-r-5 border-r-orange-200': ''}`}>
            <Image
              src={ profile.icon || "/default_icon.svg" }
              width={24}
              height={24}
              alt="no image"
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 "
            />
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