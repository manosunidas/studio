
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, User, MapPin, Tag, ArrowLeft, Mail, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Item } from '@/lib/types';
import { useUser, useDoc, useFirestore, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { doc, addDoc, collection, serverTimestamp, runTransaction, updateDoc, increment } from 'firebase/firestore';


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

const requestSchema = z.object({
  nombreCompleto: z.string().min(3, 'El nombre completo es obligatorio'),
  direccion: z.string().min(5, 'La dirección es obligatoria'),
  telefono: z.string().min(7, 'El teléfono es obligatorio'),
});
type RequestFormData = z.infer<typeof requestSchema>;


export default function ItemPage() {
  const params = useParams();
  const id = params.id as string;
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isRequestDialogOpen, setRequestDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema)
  });

  const itemRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'materials', id);
  }, [firestore, id]);

  const { data: item, isLoading: isItemLoading } = useDoc<Item>(itemRef);

  const handleRequest = async (data: RequestFormData) => {
    if (!id || !firestore) return;
    setIsSubmitting(true);
    
    const requestsCollectionRef = collection(firestore, 'materials', id, 'requests');
    const materialDocRef = doc(firestore, 'materials', id);

    const newRequestData = {
      materialId: id,
      nombreCompleto: data.nombreCompleto,
      direccion: data.direccion,
      telefono: data.telefono,
      fechaSolicitud: serverTimestamp(),
      status: 'Pendiente' as const,
    };
    
    addDoc(requestsCollectionRef, newRequestData).then(() => {
      // Increment the solicitudes count, non-blocking
      updateDoc(materialDocRef, { solicitudes: increment(1) });
      
      toast({
          title: '¡Solicitud enviada!',
          description: 'Tu solicitud ha sido registrada. El donante será notificado.',
      });
      setRequestDialogOpen(false);
    }).catch((e: any) => {
      // This is where we catch permission errors and create a contextual error.
      const permissionError = new FirestorePermissionError({
          path: `materials/${id}/requests`,
          operation: 'create',
          requestResourceData: newRequestData
      });
      errorEmitter.emit('permission-error', permissionError);

    }).finally(() => {
        setIsSubmitting(false);
    });
  };
  
  if (isItemLoading || !item) {
    return <div className="container text-center py-20">Cargando artículo...</div>;
  }
  
  const isAdmin = user?.email === 'jhelenandreat@gmail.com';
  const isAvailable = item.status === 'Disponible';


  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="relative aspect-square w-full rounded-lg overflow-hidden shadow-lg">
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover"
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
                  
                   {isAvailable && (
                      <Dialog open={isRequestDialogOpen} onOpenChange={setRequestDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="lg">
                            <Heart className="mr-2 h-5 w-5" />
                            Solicitar Artículo
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <form onSubmit={handleSubmit(handleRequest)}>
                            <DialogHeader>
                              <DialogTitle>Solicitar este artículo</DialogTitle>
                              <DialogDescription>
                                Completa tus datos para que el donante pueda contactarte. Tu solicitud será revisada por el administrador.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="nombreCompleto">Nombre Completo</Label>
                                <Input id="nombreCompleto" {...register('nombreCompleto')} disabled={isSubmitting} />
                                {errors.nombreCompleto && <p className="text-sm text-destructive">{errors.nombreCompleto.message}</p>}
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="direccion">Dirección</Label>
                                <Input id="direccion" {...register('direccion')} disabled={isSubmitting} />
                                 {errors.direccion && <p className="text-sm text-destructive">{errors.direccion.message}</p>}
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="telefono">Teléfono</Label>
                                <Input id="telefono" {...register('telefono')} disabled={isSubmitting} />
                                 {errors.telefono && <p className="text-sm text-destructive">{errors.telefono.message}</p>}
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Enviando...' : 'Confirmar Solicitud'}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    )}
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
    </div>
  );
}

    