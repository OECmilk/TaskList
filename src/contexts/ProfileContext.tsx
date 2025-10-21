'use client';

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

// アプリケーション全体で使うProfileの型定義
// これを共通の型定義ファイル(例: src/types/index.ts)に移動すると、より管理しやすくなります
export type Profile = {
  name: string | null;
  icon: string | null;
  email: string;
};

// Contextが提供する値（データと、それを更新する関数）の型を定義します
type ProfileContextType = {
  profile: Profile | null;
  setProfile: Dispatch<SetStateAction<Profile | null>>;
};

// 1. Contextオブジェクトを作成します。これが「データ置き場」の本体です。
const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// 2. 作成した「データ置き場」をアプリケーションに提供するための部品（Providerコンポーネント）です。
//    この部品で囲まれた範囲内では、どこからでもプロフィール情報にアクセスできるようになります。
export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<Profile | null>(null);

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

// 3. 他のコンポーネントから簡単にプロフィール情報を呼び出すための「ショートカット」です（カスタムフック）。
//    これを使うと、毎回useContextを書く手間が省けます。
export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
