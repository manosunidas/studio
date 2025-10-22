
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Tag, ArrowLeft, ShieldAlert, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Item } from '@/lib/types';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { sendRequestEmail } from '@/ai/flows/send-request-email';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


const requestSchema = z.object({
  nombreCompleto: z.string().min(3, 'El nombre es obligatorio'),
  direccion: z.string().min(5, 'La dirección es obligatoria'),
  telefono: z.string().min(7, 'El teléfono es obligatorio'),
  eligibilityReason: z.string().min(10, 'Por favor, explica brevemente por qué necesitas el artículo.'),
  captcha: z.string().min(1, 'La respuesta del captcha es obligatoria'),
});

type RequestFormData = z.infer<typeof requestSchema>;

export default function ItemPage() {
  const params = useParams();
  const id = params.id as string;
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isRequestDialogOpen, setRequestDialogOpen] = useState(false);
  
  // State for captcha
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);

  const { user, isUserLoading, isAdmin } = useUser();

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
  });
  
  useEffect(() => {
    // Generate new captcha numbers when the dialog opens or on component mount
    if (isRequestDialogOpen) {
      setNum1(Math.floor(Math.random() * 10) + 1);
      setNum2(Math.floor(Math.random() * 10) + 1);
    }
  }, [isRequestDialogOpen]);


  const itemRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'materials', id);
  }, [firestore, id]);

  const { data: item, isLoading: isItemLoading } = useDoc<Item>(itemRef);

  const handleRequestSubmit: SubmitHandler<RequestFormData> = async (data) => {
    if (!item) return;

    // CAPTCHA validation
    const correctAnswer = num1 + num2;
    if (parseInt(data.captcha, 10) !== correctAnswer) {
      toast({
        variant: 'destructive',
        title: 'Captcha Incorrecto',
        description: 'Por favor, resuelve la suma correctamente.',
      });
      return;
    }

    try {
      const result = await sendRequestEmail({
        requesterName: data.nombreCompleto,
        requesterAddress: data.direccion,
        requesterPhone: data.telefono,
        eligibilityReason: data.eligibilityReason,
        itemName: item.title,
        itemId: item.id,
      });

      if (!result.success) {
          throw new Error(result.message || 'No se pudo enviar el correo de solicitud.');
      }

      toast({
          title: '¡Solicitud Enviada!',
          description: 'Tu solicitud ha sido enviada al administrador para su revisión.',
      });
        
      setRequestDialogOpen(false);
      reset();

    } catch(e: any) {
        console.error("Error sending request email:", e);
        toast({
          variant: 'destructive',
          title: 'Error al enviar la solicitud',
          description: e.message || 'Hubo un problema al procesar tu solicitud. Por favor, inténtalo de nuevo.',
        });
    }
  };
  
  if (isItemLoading || isUserLoading) {
    return <div className="container text-center py-20">Cargando artículo...</div>;
  }

  if (!item) {
    return <div className="container text-center py-20">Artículo no encontrado.</div>;
  }
  
  const isAvailable = item.status === 'Disponible';

  const renderRequestButton = () => {
    if (!isAvailable) {
      return null;
    }
    
    if (isAdmin) {
       return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="inline-block"> 
                        <Button size="lg" disabled>
                            <ShieldAlert className="mr-2 h-5 w-5" />
                            Solicitar Artículo
                        </Button>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Los administradores no pueden solicitar artículos.</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
       )
    }

    // Button for anonymous users
    return (
        <Dialog open={isRequestDialogOpen} onOpenChange={setRequestDialogOpen}>
            <DialogTrigger asChild>
               <Button size="lg">
                <Heart className="mr-2 h-5 w-5" />
                Solicitar Artículo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <form onSubmit={handleSubmit(handleRequestSubmit)}>
                <DialogHeader>
                  <DialogTitle>Formulario de Solicitud</DialogTitle>
                  <DialogDescription>
                    Tus datos de contacto serán enviados al administrador para coordinar la entrega.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                   <div className="grid gap-2">
                    <Label htmlFor="nombreCompleto">Nombre Completo</Label>
                    <Input id="nombreCompleto" {...register('nombreCompleto')} placeholder="Tu nombre completo" />
                    {errors.nombreCompleto && <p className="text-sm text-destructive">{errors.nombreCompleto.message}</p>}
                   </div>
                  <div className="grid gap-2">
                    <Label htmlFor="direccion">Dirección o Barrio</Label>
                    <Input id="direccion" {...register('direccion')} placeholder="Tu dirección o barrio" />
                     {errors.direccion && <p className="text-sm text-destructive">{errors.direccion.message}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="telefono">Teléfono de Contacto</Label>
                    <Input id="telefono" {...register('telefono')} placeholder="Tu número de teléfono" />
                     {errors.telefono && <p className="text-sm text-destructive">{errors.telefono.message}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="eligibilityReason">Motivo de la Solicitud</Label>
                    <Textarea id="eligibilityReason" {...register('eligibilityReason')} placeholder="Explica brevemente por qué necesitas este artículo para tus estudios." />
                    {errors.eligibilityReason && <p className="text-sm text-destructive">{errors.eligibilityReason.message}</p>}
                  </div>
                   <div className="grid gap-2 p-3 bg-muted rounded-md">
                    <Label htmlFor="captcha">Verificación (Captcha)</Label>
                    <p className="text-sm text-muted-foreground">¿Cuánto es {num1} + {num2}?</p>
                    <Input id="captcha" type="number" {...register('captcha')} placeholder="Tu respuesta" />
                     {errors.captcha && <p className="text-sm text-destructive">{errors.captcha.message}</p>}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setRequestDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
    );
  }

  const getFormattedDate = () => {
    if (item.datePosted && typeof item.datePosted.toDate === 'function') {
      try {
        return format(item.datePosted.toDate(), "dd 'de' MMMM 'de' yyyy", { locale: es });
      } catch (error) {
        console.error("Error formatting date:", error);
        return 'Fecha no disponible';
      }
    }
    return 'Fecha no disponible';
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="relative aspect-square w-full rounded-lg overflow-hidden shadow-lg">
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-contain rounded-lg"
            sizes="(max-width: 768px) 100vw, 50vw"
            data-ai-hint={item.imageHint}
          />
           <div className="absolute top-4 left-4">
              {item.status === 'Asignado' ? (
                <Badge variant="destructive" className="text-lg">Asignado</Badge>
              ) : (
                 <Badge variant="default" className="text-lg bg-green-600 hover:bg-green-700">Disponible</Badge>
              )}
           </div>
        </div>
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl md:text-4xl font-bold font-headline">{item.title}</h1>
                <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                  <Button onClick={() => router.back()} variant="outline">
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Volver
                  </Button>
                </div>
            </div>
            <div className="flex items-center text-lg text-muted-foreground mt-2">
                <Calendar className="mr-2 h-5 w-5" />
                <span>Publicado el {getFormattedDate()}</span>
            </div>
          </div>
            <div className="mt-auto">
             {renderRequestButton()}
            </div>

          <p className="text-base leading-relaxed">
            {item.description}
          </p>

          <Card>
            <CardHeader>
                <CardTitle>Detalles del Artículo</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-muted-foreground"/>
                    <strong>Categoría:</strong>
                    <Badge variant="secondary">{item.category}</Badge>
                </div>
                 <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-muted-foreground"/>
                    <strong>Condición:</strong>
                    <Badge variant="outline">{item.condition}</Badge>
                </div>
                 <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-muted-foreground"/>
                    <strong>Nivel Escolar:</strong>
                    <Badge variant="outline">{item.gradeLevel}</Badge>
                </div>
            </CardContent>
          </Card>
           
           {item.status === 'Asignado' && (
            <div className="p-4 bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700 rounded-lg text-center text-yellow-800 dark:text-yellow-200">
              Este artículo ya fue asignado por el administrador.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
