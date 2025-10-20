import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Footer } from '@/components/layout/footer';
import { FirebaseClientProvider } from '@/firebase';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const DynamicHeader = dynamic(() => import('@/components/layout/dynamic-header'), {
  ssr: false,
  loading: () => (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-24 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2 font-bold text-5xl">
          <Skeleton className="h-24 w-24 rounded-lg" />
          <Skeleton className="h-10 w-48 hidden sm:inline" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="w-24 h-8 rounded-md md:w-32" />
          <Skeleton className="w-12 h-12 rounded-full hidden md:block" />
          <Skeleton className="w-8 h-8 rounded-md md:hidden" />
        </div>
      </div>
    </header>
  ),
});


export const metadata: Metadata = {
  title: 'Manos Unidas Digital',
  description: 'Facilitando la donación e intercambio de materiales escolares y uniformes.',
  keywords: ['donación', 'material escolar', 'uniformes', 'intercambio', 'comunidad'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased flex flex-col',
          'font-body'
        )}
      >
        <FirebaseClientProvider>
          <DynamicHeader />
          <main className="flex-grow">{children}</main>
          <Footer />
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
