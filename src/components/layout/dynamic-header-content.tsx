'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const NavLink = ({ href, label }: { href: string; label: string }) => (
    <Link
      href={href}
      className={cn(
        'text-2xl font-medium transition-colors hover:text-primary',
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
                  <Button variant="ghost" className="relative h-24 w-24 rounded-full">
                     <Avatar className="h-24 w-24">
                        <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'Avatar'} />
                        <AvatarFallback className="text-4xl">{getInitials(user.displayName)}</AvatarFallback>
                      </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                     <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                  </DropdownMenuLabel>
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
                <Link href="/login" className="text-2xl">Iniciar Sesión (Admin)</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation & Auth */}
        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-12 w-12" />
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
                      <Link href="/profile" className="flex items-center gap-4 text-2xl font-medium" onClick={() => setSheetOpen(false)}>
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'Avatar'} />
                            <AvatarFallback className="text-4xl">{getInitials(user.displayName)}</AvatarFallback>
                        </Avatar>
                        <div>
                             <p className="text-lg font-semibold">{user.displayName}</p>
                             <p className="text-sm text-muted-foreground">Mi Perfil</p>
                        </div>
                      </Link>
                      <Button onClick={() => { handleLogout(); setSheetOpen(false); }} size="lg">Cerrar Sesión</Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <Button variant="ghost" asChild>
                        <Link href="/login" className="text-2xl" onClick={() => setSheetOpen(false)}>Iniciar Sesión (Admin)</Link>
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
        <Menu className="h-12 w-12" />
        <span className="sr-only">Abrir menú</span>
      </Button>
    </div>
  );
}
