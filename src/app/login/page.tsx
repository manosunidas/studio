// cargue forzado
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

/**
 * @fileoverview LoginPage component.
 * This page provides a login interface specifically for administrators.
 * It uses Firebase Authentication with the Google provider.
 * If a non-admin user attempts to log in, they are shown an error and redirected.
 * If a user is already logged in as an admin, they are redirected to the admin profile page.
 */

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading, isAdmin } = useUser();
  const auth = getAuth();

  useEffect(() => {
    // This effect handles redirection for already logged-in users.
    if (!isUserLoading && user && !user.isAnonymous) {
      if (isAdmin) {
         // If the user is an admin, inform them and redirect to the admin panel.
         toast({
          title: 'Ya has iniciado sesión',
          description: 'Redirigiendo al panel de administrador.',
        });
        router.replace('/profile');
      } else {
         // If a non-admin user is somehow logged in, just send them to the homepage.
        router.replace('/');
      }
    }
  }, [user, isUserLoading, isAdmin, router, toast]);


  /**
   * Handles the Google login process.
   * It initiates the Firebase Google sign-in popup. After a successful sign-in,
   * it checks if the user's email is in the list of administrators.
   * If they are an admin, they are redirected. Otherwise, they are signed out,
   * shown an error message, and redirected to the homepage.
   */
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    // Force account selection every time.
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    try {
      const result = await signInWithPopup(auth, provider);
      const signedInUser = result.user;

      // Check if the signed-in user is an administrator.
      if (isAdminUser(signedInUser)) {
         toast({
            title: 'Inicio de sesión exitoso',
            description: '¡Bienvenido de nuevo, administrador!',
          });
          router.push('/profile');
      } else {
          // If a non-admin user signs in, show an error, sign them out, and redirect.
          await auth.signOut();
          toast({
            variant: 'destructive',
            title: 'Acceso no autorizado',
            description: 'Solo los administradores pueden iniciar sesión.',
          });
          router.push('/');
      }

    } catch (error: any) {
      // Ignore the common error when a user closes the popup without signing in.
      if (error.code === 'auth/popup-closed-by-user') {
        return;
      }
      // Show other errors in a toast.
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
