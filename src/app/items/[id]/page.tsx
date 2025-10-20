'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, User, MapPin, Tag, ArrowLeft, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Item } from '@/lib/types';
import { useAuth, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
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

export default function ItemPage() {
  const params = useParams();
  const id = params.id as string;
  const firestore = useFirestore();
  const { user, isUserLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const itemRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'materials', id);
  }, [firestore, id]);

  const { data: item, isLoading: isItemLoading } = useDoc<Item>(itemRef);

  const handleReserve = async () => {
    if (!item || !itemRef) return;
     if (!user) {
      toast({
        title: 'Inicia sesión para reservar',
        description: 'Debes iniciar sesión para poder reservar un artículo.',
        variant: 'destructive',
      });
      router.push('/login');
      return;
    }
    const updatedData = { isReserved: true, reservedBy: user.email, status: 'Reservado' as const };
    await updateDoc(itemRef, updatedData);
    toast({
        title: '¡Artículo reservado!',
        description: 'Has reservado este artículo con éxito.',
    });
  };
  
  const handleCancelReservation = async () => {
    if (!item || !itemRef) return;
    const updatedData = { isReserved: false, reservedBy: '', status: 'Disponible' as const };
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
        title: 'Artículo eliminado',
        description: 'El artículo ha sido eliminado de la plataforma.',
    });
    router.push('/profile');
  }

  if (isUserLoading || isItemLoading || !item) {
    return <div className="container text-center py-20">Cargando artículo...</div>;
  }

  const isOwner = user?.email === item.postedBy;
  const canReserve = !item.isReserved && !isOwner;
  const hasReserved = item.isReserved && item.reservedBy === user?.email;
  const isReservedByOther = item.isReserved && item.reservedBy !== user?.email && !isOwner;

  const getContactEmail = () => {
    if (isOwner && item.reservedBy) return item.reservedBy;
    if (hasReserved) return item.postedBy;
    return null;
  }

  const contactEmail = getContactEmail();

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
                  {user && (
                  <Button onClick={() => router.push('/profile')} variant="outline">
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Volver al Perfil
                  </Button>
                  )}
                  {canReserve && (
                    <Button onClick={handleReserve} size="lg">
                      <Heart className="mr-2 h-5 w-5" />
                      Reservar
                    </Button>
                  )}
                  {hasReserved && (
                     <Button onClick={handleCancelReservation} size="lg" variant="destructive">
                      Cancelar Reserva
                    </Button>
                  )}
                </div>
            </div>
            <p className="text-lg text-muted-foreground mt-2">
              Publicado por <span className="font-semibold text-primary">{item.postedByName || item.postedBy.split('@')[0]}</span>
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

           {contactEmail && (
              <Card>
                <CardHeader>
                  <CardTitle>Coordinar Entrega</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <p>Ponte en contacto para coordinar la recogida del artículo.</p>
                   <Button asChild variant="outline">
                    <a href={`mailto:${contactEmail}`}>
                      <Mail className="mr-2 h-4 w-4" />
                      Contactar por correo: {contactEmail}
                    </a>
                  </Button>
                </CardContent>
              </Card>
           )}

           {isOwner && (
             <div className="p-4 bg-blue-100 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-700 rounded-lg text-center text-blue-800 dark:text-blue-200 flex items-center justify-between">
              <div>
                <p className="font-bold">Eres el propietario de este artículo.</p>
                {item.isReserved && <p className="text-sm">Reservado por: {item.reservedBy}</p>}
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Marcar como Entregado</Button>
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
