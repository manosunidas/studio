// cargue forzado
import type { Metadata } from 'next';
import Image from 'next/image';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Footer } from '@/components/layout/footer';
import { FirebaseClientProvider } from '@/firebase';
import Header from '@/components/layout/header';

/**
 * @fileoverview RootLayout component for the entire application.
 * This component wraps all pages and provides the basic HTML structure,
 * including `<html>` and `<body>` tags. It sets up global styles, fonts,
 * and providers that need to be available on every page.
 */


// Metadata for SEO and browser information.
export const metadata: Metadata = {
  title: 'Manos Unidas Digital',
  description: 'Facilitando la donación e intercambio de materiales escolares y uniformes.',
  keywords: ['donación', 'material escolar', 'uniformes', 'intercambio', 'comunidad'],
};

/**
 * The root layout of the application.
 * @param {Readonly<{ children: React.ReactNode }>} props - The component props.
 * @param {React.ReactNode} props.children - The child components to be rendered within the layout.
 * @returns {JSX.Element} The root layout structure.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Preconnect to Google Fonts for performance. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Link to the PT Sans font used throughout the application. */}
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
        {/* Provides Firebase context to the entire application. */}
        <FirebaseClientProvider>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
          {/* Toaster component for displaying notifications. */}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
