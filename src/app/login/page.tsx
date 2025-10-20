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
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import { useUser } from '@/firebase';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const auth = getAuth();

  useEffect(() => {
    // Redirect admin to profile if they land here already logged in
    if (!isUserLoading && user && !user.isAnonymous) {
      toast({
        title: 'Ya has iniciado sesión',
        description: 'Redirigiendo a tu perfil.',
      });
      router.replace('/profile');
    }
  }, [user, isUserLoading, router, toast]);


  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({
        title: 'Inicio de sesión exitoso',
        description: '¡Bienvenido de nuevo, administrador!',
      });
      router.push('/profile');
    } catch (error: any) {
      // Don't show an error toast if the user simply closes the popup.
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
          <CardTitle className="text-2xl font-headline">Acceso de Administrador</CardTitle>
          <CardDescription>
            Usa tu cuenta de Google para gestionar la plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button onClick={handleGoogleLogin} className="w-full">
            Iniciar Sesión con Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
