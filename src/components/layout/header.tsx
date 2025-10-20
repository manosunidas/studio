'use client';

import Link from 'next/link';
import { HandHeart, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DynamicHeaderContent } from './dynamic-header-content';


export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <HandHeart className="h-6 w-6 text-primary" />
            <span className="hidden sm:inline">Manos Unidas</span>
        </Link>
        
        <DynamicHeaderContent />
      </div>
    </header>
  );
}
