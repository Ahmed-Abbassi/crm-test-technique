import type { Metadata } from 'next';
import './globals.css';
import SidebarNav from '@/components/SidebarNav';

export const metadata: Metadata = {
  title: 'Nexus CRM',
  description: 'Enterprise CRM Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen">
          <SidebarNav />
          <main className="flex-1 ml-[220px] min-h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}