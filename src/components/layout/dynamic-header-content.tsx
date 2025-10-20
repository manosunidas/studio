'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { getAuth, signOut } from 'firebase/auth';

export function DynamicHeaderContent() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSheetOpen, setSheetOpen] = useState(false);
  const { user } = useUser();
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión exitosamente.',
      });
      router.push('/');
    } catch (error) {
      toast({
        title: 'Error al cerrar sesión',
        description: 'Hubo un problema al cerrar tu sesión.',
        variant: 'destructive',
      });
    }
  };

  const NavLink = ({ href, label }: { href: string; label: string }) => (
    <Link
      href={href}
      className={cn(
        'text-xl font-medium transition-colors hover:text-primary',
        pathname === href ? 'text-primary' : 'text-muted-foreground'
      )}
      onClick={() => setSheetOpen(false)}
    >
      {label}
    </Link>
  );

  const renderDynamicContent = () => {
    const isAdmin = user?.email === 'jhelenandreat@gmail.com';
    const navLinks = [
      { href: '/', label: 'Inicio' },
      ...(isAdmin ? [{ href: '/profile', label: 'Mi Panel' }] : []),
    ];

    return (
      <>
        {/* Desktop Navigation & Auth */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </nav>
          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="rounded-full w-12 h-12">
                    <UserCircle className="h-8 w-8" />
                    <span className="sr-only">Toggle user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Mi Perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Cerrar Sesión</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" asChild>
                <Link href="/login" className="text-xl">Iniciar Sesión (Admin)</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation & Auth */}
        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-10 w-10" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col h-full">
                <div className="border-b pb-4">
                  <span className="font-bold text-2xl">Menú</span>
                </div>
                <nav className="flex flex-col gap-4 py-6">
                  {navLinks.map((link) => (
                    <NavLink key={link.href} {...link} />
                  ))}
                </nav>
                <div className="mt-auto border-t pt-6">
                  {user ? (
                    <div className="flex flex-col gap-4">
                      <Link href="/profile" className="flex items-center gap-2 text-xl font-medium" onClick={() => setSheetOpen(false)}>
                        <UserCircle className="w-8 h-8" /> Mi Perfil
                      </Link>
                      <Button onClick={() => { handleLogout(); setSheetOpen(false); }} size="lg">Cerrar Sesión</Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <Button variant="ghost" asChild>
                        <Link href="/login" className="text-xl" onClick={() => setSheetOpen(false)}>Iniciar Sesión (Admin)</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </>
    );
  };
  
  return isMounted ? renderDynamicContent() : (
    <div className="md:hidden">
      <Button variant="ghost" size="icon" disabled>
        <Menu className="h-10 w-10" />
        <span className="sr-only">Abrir menú</span>
      </Button>
    </div>
  );
}
