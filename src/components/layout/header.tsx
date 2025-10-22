// cargue forzado
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { DynamicHeaderContent } from './dynamic-header-content';

/**
 * @fileoverview Header component for the application.
 * This component renders the main site navigation header. It includes the
 * application logos and name, and it delegates the rendering of dynamic
 * content (like login/logout buttons) to the `DynamicHeaderContent` component.
 * The header is responsive and adjusts its size for mobile devices.
 */
export default function Header() {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-20 sm:h-24 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 sm:gap-4 font-bold text-xl sm:text-3xl">
              {/* Main App Logo */}
              <Image src="/img/logo_manosunidas.jpg" alt="Manos Unidas Logo" width={60} height={60} className="rounded-lg w-16 h-16 sm:w-20 sm:h-20" />
              <span className="whitespace-nowrap">Manos Unidas</span>
              {/* Secondary Partner Logo */}
              <Image src="/img/AMOROSO_LOGO.png" alt="Amoroso Logo" width={60} height={60} className="w-16 h-16 sm:w-20 sm:h-20" />
          </Link>
          {/* Dynamic content is handled separately for cleaner code and logic isolation. */}
          <DynamicHeaderContent />
        </div>
      </header>
    );
  }
