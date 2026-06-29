import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CRM',
  description: 'CRM Module',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-56 bg-white border-r border-gray-200 fixed h-screen flex flex-col">
            <div className="px-5 py-6 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">C</span>
                </div>
                <span className="font-semibold text-gray-900 text-sm">CRM</span>
              </div>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              <Link
                href="/opportunities"
                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
                </svg>
                Opportunities
              </Link>
              <Link
                href="/clients"
                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
                Clients
              </Link>
              <Link
                href="/pipeline"
                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
                Pipeline
              </Link>
            </nav>
            <div className="px-5 py-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">CRM v1.0</p>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 ml-56">{children}</main>
        </div>
      </body>
    </html>
  );
}