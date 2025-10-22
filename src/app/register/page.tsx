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

/**
 * @fileoverview RegisterPage component.
 * This component provides an interface for users to "register".
 * In this application's context, registration is simulated and primarily serves as a way
 * to guide legitimate administrators to the login flow.
 * It uses Firebase's Google sign-in popup. After a successful sign-in,
 * it redirects the user to their profile page, which is the intended behavior
 * for an admin.
 */
export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();

  /**
   * Handles the Google sign-in process for registration.
   * This is functionally identical to a login but provides user feedback
   * appropriate for a registration flow.
   */
  const handleGoogleLogin = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account' // Always asks the user to select an account.
    });

    try {
      await signInWithPopup(auth, provider);
      toast({
        title: '¡Cuenta creada!',
        description: 'Ahora puedes iniciar sesión con tus credenciales.',
      });
      // Redirect to the profile page, which is the admin dashboard.
      router.push('/profile');
    } catch (error: any) {
      // Display any errors during the sign-in process.
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
