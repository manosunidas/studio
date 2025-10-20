'use client';
import Link from 'next/link';
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

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
      toast({
        title: '¡Cuenta creada!',
        description: 'Ahora puedes iniciar sesión con tus credenciales.',
      });
      router.push('/profile');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error al registrarse',
        description: error.message,
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-14rem)] py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Crear una Cuenta</CardTitle>
          <CardDescription>
            Únete a la comunidad con tu cuenta de Google.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button onClick={handleGoogleLogin} className="w-full">
            Registrarse con Google
          </Button>
        </CardContent>
        <div className="mt-4 text-center text-sm mb-4">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="underline">
            Iniciar Sesión
          </Link>
        </div>
      </Card>
    </div>
  );
}
