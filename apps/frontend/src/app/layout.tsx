import type { Metadata } from 'next';
import './globals.css';
import RootClientLayout from './RootClientLayout';

export const metadata: Metadata = {
  title: 'Nexus CRM',
  description: 'Enterprise CRM Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <RootClientLayout>{children}</RootClientLayout>
      </body>
    </html>
  );
}