'use client';

import Link from 'next/link';
import Image from 'next/image';
import { DynamicHeaderContent } from './dynamic-header-content';


export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Image src="/img/logo_manosunidas.jpg" alt="Manos Unidas Logo" width={96} height={96} className="rounded-full" />
            <span className="hidden sm:inline">Manos Unidas</span>
        </Link>
        
        <DynamicHeaderContent />
      </div>
    </header>
  );
}
