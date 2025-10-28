import SideMenu from "@/components/SideMenu/SideMenu";
import { ProfileProvider } from "@/contexts/ProfileContext";

const MainLayout = ({
    children,
    drawer,
}: Readonly<{
    children: React.ReactNode;
    drawer: React.ReactNode;
}>) => {
  return (
    <ProfileProvider>
      <div className="flex h-screen">
          <SideMenu />
          <main className="bg-slate-50 flex-1 overflow-auto relative">
            { children }
            { drawer }
          </main>
      </div>
    </ProfileProvider>
  );
};
 
export default MainLayout;