import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  user?: {
    firstName?: string;
    avatar_url?: string;
    username?: string;
  };
}

const Layout: React.FC<LayoutProps> = ({ children, user }) => {
  return (
    <div className="grid grid-cols-12 h-screen bg-background-dark overflow-hidden">
      {/* SIDEBAR - COL 1-2 */}
      <div className="col-span-2 border-r border-primary/20 z-50 overflow-hidden">
        <Sidebar user={user} />
      </div>

      {/* MAIN CONTENT - COL 3-12 */}
      <div className="col-span-10 overflow-y-auto relative">
        {children}
      </div>
    </div>
  );
};

export default Layout;
