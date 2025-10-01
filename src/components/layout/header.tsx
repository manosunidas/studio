'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { HandHeart, Menu, UserCircle } from 'lucide-react';
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
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSheetOpen, setSheetOpen] = useState(false);
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const navLinks = [
    { href: '/', label: 'Inicio' },
    ...(user ? [{ href: '/profile', label: 'Mis Artículos' }] : []),
    { href: '/post-item', label: 'Publicar Artículo' },
  ];


  const handleLogout = () => {
    logout();
    toast({
      title: 'Sesión cerrada',
      description: 'Has cerrado sesión exitosamente.',
    });
    router.push('/');
  }

  const NavLink = ({ href, label }: { href: string; label: string }) => (
    <Link
      href={href}
      className={cn(
        'text-sm font-medium transition-colors hover:text-primary',
        pathname === href ? 'text-primary' : 'text-muted-foreground'
      )}
      onClick={() => setSheetOpen(false)}
    >
      {label}
    </Link>
  );

  const AuthButtons = () => (
    <div className="flex items-center gap-2">
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <UserCircle className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">Mi Perfil</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/post-item">Publicar Artículo</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Cerrar Sesión</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <>
          <Button variant="ghost" asChild>
            <Link href="/login">Iniciar Sesión</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Registrarse</Link>
          </Button>
        </>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <HandHeart className="h-6 w-6 text-primary" />
            <span className="hidden sm:inline">Manos Unidas</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <AuthButtons />
        </div>

        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col h-full">
                <div className="border-b pb-4">
                    <Link href="/" className="flex items-center gap-2 font-bold text-lg" onClick={() => setSheetOpen(false)}>
                        <HandHeart className="h-6 w-6 text-primary" />
                        <span>Manos Unidas</span>
                    </Link>
                </div>
                <nav className="flex flex-col gap-4 py-6">
                  {navLinks.map((link) => (
                    <NavLink key={link.href} {...link} />
                  ))}
                </nav>
                <div className="mt-auto border-t pt-6">
                  {user ? (
                     <div className="flex flex-col gap-4">
                        <Link href="/profile" className="flex items-center gap-2 text-sm font-medium" onClick={() => setSheetOpen(false)}><UserCircle/> Mi Perfil</Link>
                        <Button onClick={() => { handleLogout(); setSheetOpen(false); }}>Cerrar Sesión</Button>
                     </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <Button variant="ghost" asChild><Link href="/login" onClick={() => setSheetOpen(false)}>Iniciar Sesión</Link></Button>
                      <Button asChild><Link href="/register" onClick={() => setSheetOpen(false)}>Registrarse</Link></Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
