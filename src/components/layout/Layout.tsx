import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8f7fd] flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex w-full max-w-[1440px] mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-12 max-w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      <MobileNav />
    </div>
  );
};
