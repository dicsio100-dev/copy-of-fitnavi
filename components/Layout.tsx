import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import MobileHeader from './MobileHeader';

interface LayoutProps {
  children: React.ReactNode;
  user?: any;
}

const Layout: React.FC<LayoutProps> = ({ children, user }) => {
  return (
    <div className="flex flex-col md:flex-row min-h-[100dvh] bg-background-dark overflow-x-hidden relative font-sans antialiased text-white">
      {/* ATMOSPHERIC BACKGROUND LAYERS */}
      <div className="nebula-bg fixed inset-0 z-[-10]" />
      <div className="smoke-layer fixed inset-0 z-[-9]" />

      {/* MOBILE HUD HEADER */}
      <MobileHeader user={user} />

      {/* DESKTOP SIDEBAR - HIDDEN ON MOBILE */}
      <aside className="hidden md:block w-72 lg:w-80 h-screen sticky top-0 z-50 shrink-0">
        <Sidebar user={user} />
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full min-h-screen relative pt-16 md:pt-0 pb-20 md:pb-0 scrollbar-hide">
        <div className="p-4 sm:p-6 md:p-10 h-full max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <BottomNav />
    </div>
  );
};

export default Layout;
