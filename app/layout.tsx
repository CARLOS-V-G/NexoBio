import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'NexoBio — Tu página de enlaces para creadores',
    template: '%s | NexoBio',
  },
  description: 'Crea una bio profesional, comparte tus links y mide tus visitas en minutos.',
  keywords: ['linktree', 'bio link', 'creadores', 'links', 'perfil'],
  openGraph: {
    type: 'website',
    siteName: 'NexoBio',
    title: 'NexoBio — Tu página de enlaces para creadores',
    description: 'Crea una bio profesional, comparte tus links y mide tus visitas en minutos.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NexoBio',
    description: 'Tu página de enlaces para creadores.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
