'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { useFormState, useFormStatus } from 'react-dom';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, User, MapPin, Tag, ArrowLeft, Mail, Users, LogIn } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Item } from '@/lib/types';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { createRequest } from '@/app/actions/create-request';


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

const initialState = {
  message: '',
  errors: {},
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Enviando...' : 'Confirmar Solicitud'}
    </Button>
  );
}


export default function ItemPage() {
  const params = useParams();
  const id = params.id as string;
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isRequestDialogOpen, setRequestDialogOpen] = useState(false);
  
  const [state, formAction] = useFormState(createRequest, initialState);

  const itemRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'materials', id);
  }, [firestore, id]);

  const { data: item, isLoading: isItemLoading, refetch } = useDoc<Item>(itemRef);
  
  useEffect(() => {
    if (state.success) {
      toast({
        title: '¡Solicitud enviada!',
        description: 'Tu solicitud ha sido registrada. El donante será notificado.',
      });
      setRequestDialogOpen(false); // Close dialog
      refetch(); // Refetch item data to show updated request count
    } else if (state.message && !state.errors) {
       toast({
        variant: 'destructive',
        title: 'Error al enviar la solicitud',
        description: state.message,
      });
    }
  }, [state, toast, refetch]);
  
  if (isItemLoading || !item) {
    return <div className="container text-center py-20">Cargando artículo...</div>;
  }
  
  const isAdmin = user?.email === 'jhelenandreat@gmail.com';
  const isAvailable = item.status === 'Disponible';
  const canRequest = isAvailable && !isAdmin;

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
                  
                   {canRequest && (
                      <Dialog open={isRequestDialogOpen} onOpenChange={setRequestDialogOpen}>
                        <DialogTrigger asChild>
                           <Button size="lg">
                            <Heart className="mr-2 h-5 w-5" />
                            Solicitar Artículo
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <form action={formAction}>
                            <input type="hidden" name="materialId" value={id} />
                            <DialogHeader>
                              <DialogTitle>Solicitar este artículo</DialogTitle>
                              <DialogDescription>
                                Completa tus datos de contacto para que el donante pueda comunicarse contigo.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                               <div className="grid gap-2">
                                <Label htmlFor="nombreCompleto">Nombre Completo</Label>
                                <Input id="nombreCompleto" name="nombreCompleto" placeholder="Tu nombre completo" />
                                {state.errors?.nombreCompleto && <p className="text-sm text-destructive">{state.errors.nombreCompleto[0]}</p>}
                               </div>
                              <div className="grid gap-2">
                                <Label htmlFor="direccion">Dirección de Entrega</Label>
                                <Input id="direccion" name="direccion" placeholder="Tu dirección completa" />
                                 {state.errors?.direccion && <p className="text-sm text-destructive">{state.errors.direccion[0]}</p>}
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="telefono">Teléfono de Contacto</Label>
                                <Input id="telefono" name="telefono" placeholder="Tu número de teléfono" />
                                 {state.errors?.telefono && <p className="text-sm text-destructive">{state.errors.telefono[0]}</p>}
                              </div>
                            </div>
                            <DialogFooter>
                              <SubmitButton />
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
