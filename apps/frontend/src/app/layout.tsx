import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CRM Module Demo',
  description: 'Take-home CRM module built with Next.js + NestJS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen">
          {/* Sidebar */}
          <aside className="w-64 bg-white border-r border-gray-200 p-6">
            <div className="mb-8">
              <h1 className="text-xl font-bold text-gray-900">CRM</h1>
              <p className="text-sm text-gray-500">Demo Module</p>
            </div>
            <nav className="space-y-2">
              <Link
                href="/opportunities"
                className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Opportunities
              </Link>
              <Link
                href="/clients"
                className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Clients
              </Link>
              <Link
                href="/pipeline"
                className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Pipeline
              </Link>
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 overflow-auto p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}