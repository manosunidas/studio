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

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
      toast({
        title: 'Inicio de sesión exitoso',
        description: '¡Bienvenido de nuevo!',
      });
      router.push('/profile');
    } catch (error: any) {
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
          <CardTitle className="text-2xl font-headline">Iniciar Sesión</CardTitle>
          <CardDescription>
            Usa tu cuenta de Google para acceder.
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
