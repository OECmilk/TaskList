'use client';

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

// アプリケーション全体で使うProfileの型定義
// これを共通の型定義ファイル(例: src/types/index.ts)に移動すると、より管理しやすくなります
export type Profile = {
  id: string;
  name: string;
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
export const ProfileProvider = ({
  children,
  initialProfile = null
}: {
  children: ReactNode;
  initialProfile?: Profile | null;
}) => {
  // 初期値をサーバーから渡されたデータで設定
  const [profile, setProfile] = useState<Profile | null>(initialProfile);



  // サーバーからのデータが変更された場合（router.refresh()など）、stateも更新する
  // ただし、クライアント側での一時的な変更（楽観的更新）を上書きしないように注意が必要だが、
  // 今回の構成ではサーバーデータが正とする方が安全。
  const [prevInitialProfile, setPrevInitialProfile] = useState(initialProfile);
  if (initialProfile !== prevInitialProfile) {
    setProfile(initialProfile);
    setPrevInitialProfile(initialProfile);
  }

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
