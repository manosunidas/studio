
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, User, MapPin, Tag, ArrowLeft, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Item } from '@/lib/types';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const reservationSchema = z.object({
  fullName: z.string().min(3, 'El nombre completo es obligatorio'),
  address: z.string().min(5, 'La dirección es obligatoria'),
  phone: z.string().min(7, 'El teléfono es obligatorio'),
});
type ReservationFormData = z.infer<typeof reservationSchema>;


export default function ItemPage() {
  const params = useParams();
  const id = params.id as string;
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isReservationDialogOpen, setReservationDialogOpen] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema)
  });

  const itemRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'materials', id);
  }, [firestore, id]);

  const { data: item, isLoading: isItemLoading } = useDoc<Item>(itemRef);

  const handleReserve = async (data: ReservationFormData) => {
    if (!item || !itemRef) return;
    
    const updatedData = { 
      isReserved: true, 
      reservedBy: 'Reservado por un visitante', // No longer requires user email
      status: 'Reservado' as const,
      reserverFullName: data.fullName,
      reserverAddress: data.address,
      reserverPhone: data.phone,
    };
    await updateDoc(itemRef, updatedData);
    toast({
        title: '¡Artículo reservado!',
        description: 'Has reservado este artículo con éxito.',
    });
    setReservationDialogOpen(false);
  };
  
  const handleCancelReservation = async () => {
    if (!item || !itemRef) return;
    const updatedData = { 
      isReserved: false, 
      reservedBy: '', 
      status: 'Disponible' as const,
      reserverFullName: '',
      reserverAddress: '',
      reserverPhone: '',
    };
    await updateDoc(itemRef, updatedData);
     toast({
        title: 'Reserva cancelada',
        description: 'Has cancelado la reserva de este artículo.',
    });
  }

  const handleRemoveItem = async () => {
    if(!item || !itemRef) return;
    await deleteDoc(itemRef);
    toast({
        title: 'Artículo entregado',
        description: 'El artículo ha sido marcado como entregado y eliminado de la plataforma.',
    });
    router.push('/profile');
  }

  if (isUserLoading || isItemLoading || !item) {
    return <div className="container text-center py-20">Cargando artículo...</div>;
  }
  
  const isAdmin = user?.email === 'jhelenandreat@gmail.com';
  const isOwner = user?.uid === item.postedBy;
  const canReserve = !item.isReserved && !isOwner && !isAdmin;
  const hasReserved = item.isReserved && item.reservedBy === user?.email;
  const isReservedByOther = item.isReserved && item.reservedBy !== user?.email && !isOwner;


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
           {item.isReserved && (
             <div className="absolute top-4 left-4">
              <Badge variant="destructive" className="text-lg">Reservado</Badge>
             </div>
           )}
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
                  
                   {canReserve && (
                      <Dialog open={isReservationDialogOpen} onOpenChange={setReservationDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="lg">
                            <Heart className="mr-2 h-5 w-5" />
                            Reservar
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <form onSubmit={handleSubmit(handleReserve)}>
                            <DialogHeader>
                              <DialogTitle>Confirmar Reserva</DialogTitle>
                              <DialogDescription>
                                Por favor, completa tus datos para coordinar la entrega.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="fullName">Nombre Completo</Label>
                                <Input id="fullName" {...register('fullName')} />
                                {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="address">Dirección</Label>
                                <Input id="address" {...register('address')} />
                                 {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input id="phone" {...register('phone')} />
                                 {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="submit">Confirmar Reserva</Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    )}
                  {hasReserved && (
                     <Button onClick={handleCancelReservation} size="lg" variant="destructive">
                      Cancelar Reserva
                    </Button>
                  )}
                </div>
            </div>
            <p className="text-lg text-muted-foreground mt-2">
              Publicado por <span className="font-semibold text-primary">{item.postedByName || 'Usuario'}</span>
            </p>
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
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground"/>
                    <strong>Ubicación:</strong>
                    <span>Ciudad Ejemplo</span>
                </div>
            </CardContent>
          </Card>
           
           {isReservedByOther && (
            <div className="p-4 bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700 rounded-lg text-center text-yellow-800 dark:text-yellow-200">
              Este artículo ya ha sido reservado por otro usuario.
            </div>
          )}
          
          {(isOwner || hasReserved) && item.isReserved && (
            <Card>
              <CardHeader><CardTitle>Información de la Reserva</CardTitle></CardHeader>
              <CardContent className="grid gap-2 text-sm">
                 <p><strong>Reservado por:</strong> {item.reserverFullName}</p>
                 <p><strong>Dirección:</strong> {item.reserverAddress}</p>
                 <p><strong>Teléfono:</strong> {item.reserverPhone}</p>
                 <p><strong>Email de contacto:</strong> {item.reservedBy}</p>
              </CardContent>
            </Card>
           )}


           {isOwner && item.isReserved && (
             <div className="p-4 bg-blue-100 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-700 rounded-lg text-center text-blue-800 dark:text-blue-200 flex items-center justify-between">
              <p className="font-bold">Tu artículo ha sido reservado.</p>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="default">Marcar como Entregado</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Confirmas la entrega?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción eliminará la publicación de la plataforma. Asegúrate de que el artículo ya ha sido recogido por el solicitante. Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRemoveItem}>Confirmar Entrega</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
           )}
        </div>
      </div>
    </div>
  );
}

    