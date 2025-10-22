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

/**
 * @fileoverview DynamicHeaderContent component.
 * This component renders the dynamic parts of the header, which change based on
 * the user's authentication status (e.g., showing a "Login" button for guests
 * versus a user profile dropdown for authenticated administrators).
 * It handles both desktop and mobile navigation.
 */
export function DynamicHeaderContent() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSheetOpen, setSheetOpen] = useState(false); // State for mobile navigation sheet.
  const { user, isUserLoading, isAdmin } = useUser();
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false); // State to prevent hydration mismatches.

  useEffect(() => {
    setIsMounted(true);
  }, []);

  /**
   * Handles the user logout process.
   */
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
  
  /**
   * Generates initials from a display name for the Avatar fallback.
   * @param name The user's display name.
   */
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  /**
   * A reusable NavLink component that highlights the active link.
   */
  const NavLink = ({ href, label, className }: { href: string; label: string, className?: string }) => (
    <Link
      href={href}
      className={cn(
        'font-medium transition-colors hover:text-primary',
        pathname === href ? 'text-primary' : 'text-muted-foreground',
        className
      )}
      onClick={() => setSheetOpen(false)}
    >
      {label}
    </Link>
  );

  /**
   * Renders the appropriate content based on user state and screen size.
   */
  const renderDynamicContent = () => {
    // Define navigation links. The admin panel link is shown conditionally.
    const navLinks = [
      { href: '/', label: 'Inicio', className: "text-lg" },
      ...(isAdmin ? [{ href: '/profile', label: 'Mi Panel', className: "text-lg" }] : []),
    ];

    // Show a loading skeleton while waiting for auth state to be resolved.
    if (isUserLoading || !isMounted) {
       return (
         <div className="flex items-center gap-4">
             <div className="w-48 h-10 bg-muted rounded-md animate-pulse"></div>
         </div>
       )
    }

    return (
      <>
        {/* Desktop Navigation & Auth Actions */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </nav>
          <div className="flex items-center gap-4">
            {isAdmin ? (
              // If user is an admin, show a profile dropdown menu.
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-12 w-12 rounded-full">
                     <Avatar className="h-12 w-12">
                        <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'Avatar'} />
                        <AvatarFallback className="text-xl">{getInitials(user?.displayName)}</AvatarFallback>
                      </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                     <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Mi Panel</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Cerrar Sesión</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
               // If user is not an admin, show the login button.
               <Button asChild>
                <Link href="/login">Iniciar Sesión (Admin)</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation & Auth Actions (using a Sheet component) */}
        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-8 w-8" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col h-full">
                <div className="border-b pb-4">
                  <span className="font-bold text-lg">Menú</span>
                </div>
                <nav className="flex flex-col gap-4 py-6">
                  {navLinks.map((link) => (
                    <NavLink key={link.href} {...link} />
                  ))}
                </nav>
                <div className="mt-auto border-t pt-6">
                  {isAdmin ? (
                    // Admin actions in the mobile sheet.
                    <div className="flex flex-col gap-4">
                      <Link href="/profile" className="flex items-center gap-4 text-lg font-medium" onClick={() => setSheetOpen(false)}>
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'Avatar'} />
                            <AvatarFallback className="text-xl">{getInitials(user?.displayName)}</AvatarFallback>
                        </Avatar>
                        <div>
                             <p className="text-base font-semibold">{user?.displayName}</p>
                             <p className="text-sm text-muted-foreground">Ir al Panel</p>
                        </div>
                      </Link>
                      <Button onClick={() => { handleLogout(); setSheetOpen(false); }} size="lg">Cerrar Sesión</Button>
                    </div>
                  ) : (
                    // Guest actions in the mobile sheet.
                    <div className="flex flex-col gap-4">
                      <Button asChild size="lg">
                        <Link href="/login" onClick={() => setSheetOpen(false)}>Iniciar Sesión (Admin)</Link>
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
  
  return renderDynamicContent();
}
