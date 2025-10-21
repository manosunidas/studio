'use client';

import Link from 'next/link';
import Image from 'next/image';
import { DynamicHeaderContent } from './dynamic-header-content';


export default function Header() {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-24 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-4 font-bold text-3xl sm:text-4xl">
              <Image src="/img/logo_manosunidas.jpg" alt="Manos Unidas Logo" width={80} height={80} className="rounded-lg" />
              <span className="hidden sm:inline">Manos Unidas</span>
              <Image src="/img/AMOROSO_LOGO.png" alt="Amoroso Logo" width={80} height={80} />
          </Link>
          <DynamicHeaderContent />
        </div>
      </header>
    );
  }
