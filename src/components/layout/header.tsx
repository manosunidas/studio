'use client';

import Link from 'next/link';
import Image from 'next/image';
import { DynamicHeaderContent } from './dynamic-header-content';
import { Suspense } from 'react';
import { Skeleton } from '../ui/skeleton';


export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-24 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-5xl">
            <Image src="/img/logo_manosunidas.jpg" alt="Manos Unidas Logo" width={96} height={96} />
            <span className="hidden sm:inline">Manos Unidas</span>
        </Link>
        
        <Suspense fallback={
          <div className="flex items-center gap-4">
              <Skeleton className="w-24 h-8 rounded-md md:w-32" />
              <Skeleton className="w-12 h-12 rounded-full hidden md:block" />
              <Skeleton className="w-8 h-8 rounded-md md:hidden" />
          </div>
        }>
          <DynamicHeaderContent />
        </Suspense>
      </div>
    </header>
  );
}
