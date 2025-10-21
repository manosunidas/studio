'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, User, MapPin, Tag, ArrowLeft, Users, Copy, Mail, LogIn } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Item } from '@/lib/types';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


const requestSchema = z.object({
  nombreCompleto: z.string().min(3, 'El nombre es obligatorio'),
  direccion: z.string().min(5, 'La dirección es obligatoria'),
  telefono: z.string().min(7, 'El teléfono es obligatorio'),
});

type RequestFormData = z.infer<typeof requestSchema>;

export default function ItemPage() {
  const params = useParams();
  const id = params.id as string;
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isRequestDialogOpen, setRequestDialogOpen] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [formDataForMail, setFormDataForMail] = useState<RequestFormData | null>(null);

  const { user, isAdmin } = useUser();

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
  });

  // Pre-fill form if user is logged in
  useState(() => {
    if (user && !user.isAnonymous) {
        setValue('nombreCompleto', user.displayName || '');
    }
  });


  const itemRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'materials', id);
  }, [firestore, id]);

  const { data: item, isLoading: isItemLoading, refetch } = useDoc<Item>(itemRef);

  const handleRequestSubmit: SubmitHandler<RequestFormData> = async (data) => {
    if (!item) return;
    setFormDataForMail(data);
    setRequestDialogOpen(false);
    setShowSuccessDialog(true);
  };
  
  if (isItemLoading || !item) {
    return <div className="container text-center py-20">Cargando artículo...</div>;
  }
  
  const isAvailable = item.status === 'Disponible';
  const isUserAnonymous = !user || user.isAnonymous;

  const mailtoHref = formDataForMail && item ? `mailto:jhelenandreat@gmail.com?subject=${encodeURIComponent(`Solicitud de Artículo: ${item.title}`)}&body=${encodeURIComponent(
    `Hola,
    
Me gustaría solicitar el siguiente artículo:
- Artículo: ${item.title} (ID: ${item.id})

Mis datos de contacto son:
- Nombre: ${formDataForMail.nombreCompleto}
- Dirección/Barrio: ${formDataForMail.direccion}
- Teléfono: ${formDataForMail.telefono}

Gracias.`
  )}` : "";
  
  const copyToClipboard = () => {
    if (!formDataForMail || !item) return;
    const textToCopy = `Hola, me gustaría solicitar el siguiente artículo:
- Artículo: ${item.title} (ID: ${item.id})
Mis datos de contacto son:
- Nombre: ${formDataForMail.nombreCompleto}
- Dirección/Barrio: ${formDataForMail.direccion}
- Teléfono: ${formDataForMail.telefono}
Gracias.`;
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: "Información copiada",
      description: "Los detalles de la solicitud se han copiado al portapapeles."
    })
  }
  
  const renderRequestButton = () => {
    if (!isAvailable) {
      return null;
    }
    
    if (isUserAnonymous) {
      return (
        <Button size="lg" onClick={() => router.push('/login')}>
          <LogIn className="mr-2 h-5 w-5" />
          Iniciar Sesión para Solicitar
        </Button>
      );
    }
    
    if (isAdmin) {
       return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="inline-block"> 
                        <Button size="lg" disabled>
                            <Heart className="mr-2 h-5 w-5" />
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

    return (
        <Dialog open={isRequestDialogOpen} onOpenChange={setRequestDialogOpen}>
            <DialogTrigger asChild>
               <Button size="lg">
                <Heart className="mr-2 h-5 w-5" />
                Solicitar Artículo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleSubmit(handleRequestSubmit)}>
                <DialogHeader>
                  <DialogTitle>Solicitar este artículo</DialogTitle>
                  <DialogDescription>
                    Confirma tus datos para generar la información de contacto para el donante.
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
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setRequestDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Generando...' : 'Generar Información'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="relative aspect-square w-full rounded-lg overflow-hidden shadow-lg">
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover rounded-lg"
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
                  {renderRequestButton()}
                </div>
            </div>
            <p className="text-lg text-muted-foreground mt-2">
              Publicado por <span className="font-semibold text-primary">{item.postedByName || 'Usuario'}</span>
            </p>
             <div className="flex items-center gap-2 mt-4">
                <Users className="w-5 h-5 text-muted-foreground"/>
                <span className="font-semibold">{item.solicitudes || 0} personas han solicitado este artículo.</span>
            </div>
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
           
           {!isAvailable && item.asignadoA && (
            <div className="p-4 bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700 rounded-lg text-center text-yellow-800 dark:text-yellow-200">
              Artículo asignado a la solicitud con ID: <span className="font-mono text-sm bg-yellow-200 dark:bg-yellow-800 px-2 py-1 rounded">{item.asignadoA.substring(0, 8)}...</span>
            </div>
          )}
           {!isAvailable && !item.asignadoA && (
            <div className="p-4 bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700 rounded-lg text-center text-yellow-800 dark:text-yellow-200">
              Este artículo ya ha sido asignado.
            </div>
          )}
        </div>
      </div>
      
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¡Información Generada!</AlertDialogTitle>
            <AlertDialogDescription>
              Por favor, contacta al donante (administrador) para coordinar la entrega. Puedes enviarle un correo con la información de tu solicitud o copiarla para enviarla por otro medio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {formDataForMail && item && (
             <div className="p-4 bg-muted rounded-md text-sm">
              <p><strong>Artículo:</strong> {item.title}</p>
              <p><strong>Nombre:</strong> {formDataForMail.nombreCompleto}</p>
              <p><strong>Dirección:</strong> {formDataForMail.direccion}</p>
              <p><strong>Teléfono:</strong> {formDataForMail.telefono}</p>
            </div>
          )}
          <AlertDialogFooter className="sm:justify-start gap-2">
             <AlertDialogAction asChild className="w-full sm:w-auto">
               <a href={mailtoHref}>
                <Mail className="mr-2 h-4 w-4" /> Enviar por Correo
               </a>
             </AlertDialogAction>
             <Button variant="secondary" onClick={copyToClipboard} className="w-full sm:w-auto">
                <Copy className="mr-2 h-4 w-4" /> Copiar Información
             </Button>
            <Button variant="outline" onClick={() => setShowSuccessDialog(false)} className="w-full sm:w-auto mt-2 sm:mt-0">Cerrar</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

    