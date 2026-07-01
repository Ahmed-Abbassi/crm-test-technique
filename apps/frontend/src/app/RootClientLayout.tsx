'use client';

import SidebarNav from '@/components/SidebarNav';
import { ToastProvider } from '@/components/ToastProvider';

export default function RootClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen">
        <SidebarNav />
        <main className="flex-1 lg:ml-[240px] min-h-screen pt-14 lg:pt-0">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}