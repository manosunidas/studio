'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useEffect } from 'react';
import { useUser } from '@/firebase';
import { isAdminUser } from '@/lib/admins';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading, isAdmin } = useUser();
  const auth = getAuth();

  useEffect(() => {
    if (!isUserLoading && user && !user.isAnonymous) {
      if (isAdmin) {
         toast({
          title: 'Ya has iniciado sesión',
          description: 'Redirigiendo al panel de administrador.',
        });
        router.replace('/profile');
      } else {
         // Non-admin users are not supposed to log in.
         // If they somehow do, just send them to the home page.
        router.replace('/');
      }
    }
  }, [user, isUserLoading, isAdmin, router, toast]);


  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    try {
      const result = await signInWithPopup(auth, provider);
      const signedInUser = result.user;

      if (isAdminUser(signedInUser)) {
         toast({
            title: 'Inicio de sesión exitoso',
            description: '¡Bienvenido de nuevo, administrador!',
          });
          router.push('/profile');
      } else {
          // If a non-admin user signs in, show a message and keep them on the homepage
          await auth.signOut();
          toast({
            variant: 'destructive',
            title: 'Acceso no autorizado',
            description: 'Solo los administradores pueden iniciar sesión.',
          });
          router.push('/');
      }

    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        return;
      }
      toast({
        variant: 'destructive',
        title: 'Error al iniciar sesión',
        description: error.message,
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-14rem)] py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Iniciar Sesión (Admin)</CardTitle>
          <CardDescription>
            Usa tu cuenta de Google de administrador para acceder al panel.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button onClick={handleGoogleLogin} className="w-full">
            Continuar con Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
