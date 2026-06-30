'use client';

import SidebarNav from '@/components/SidebarNav';
import { ToastProvider } from '@/components/ToastProvider';

export default function RootClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen">
        <SidebarNav />
        <main className="flex-1 ml-[220px] min-h-screen">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}