
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ItemCard } from '@/components/item-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useUser, useCollection, useFirestore, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, query, where, doc, deleteDoc, serverTimestamp, addDoc, updateDoc } from 'firebase/firestore';
import type { Item, Solicitud } from '@/lib/types';
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
} from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';


const formSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  description: z.string().min(1, 'La descripción es obligatoria'),
  category: z.enum(['Ropa', 'Útiles', 'Tecnología', 'Libros', 'Uniformes', 'Calzado'], { required_error: 'Selecciona una categoría' }),
  condition: z.enum(['Nuevo', 'Como nuevo', 'Usado'], { required_error: 'Selecciona la condición' }),
  gradeLevel: z.enum(['Preescolar', 'Primaria', 'Secundaria', 'Todos'], { required_error: 'Selecciona el nivel escolar' }),
  imageUrl: z.string().url('Por favor, introduce una URL de imagen válida.').min(1, 'La URL de la imagen es obligatoria.'),
});

type FormData = z.infer<typeof formSchema>;

function PostItemForm({ onFormSubmit }: { onFormSubmit: () => void }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormData) => {
    if (!user || !firestore) return;
    
    setIsSubmitting(true);

    const materialsCollection = collection(firestore, 'materials');
    const newMaterialData = {
        ...data,
        imageHint: 'school supplies',
        postedBy: user.uid,
        postedByName: user.displayName || user.email,
        datePosted: serverTimestamp(),
        status: 'Disponible' as const,
        solicitudes: 0,
    };
    
    addDoc(materialsCollection, newMaterialData).then(() => {
        toast({
            title: '¡Artículo publicado!',
            description: 'El artículo ahora está visible para la comunidad.',
        });
        reset();
        onFormSubmit();
    }).catch((serverError) => {
      const permissionError = new FirestorePermissionError({
        path: materialsCollection.path,
        operation: 'create',
        requestResourceData: newMaterialData,
      });
      errorEmitter.emit('permission-error', permissionError);
    }).finally(() => {
        setIsSubmitting(false);
    });
  };
  
  return (
      <Card className="w-full max-w-2xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="text-3xl font-headline">Publicar un Artículo</CardTitle>
            <CardDescription>
              Completa el formulario para donar un artículo a la comunidad.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="title">Título del Artículo</Label>
                <Input id="title" placeholder="Ej: Mochila escolar azul" {...register('title')} disabled={isSubmitting} />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describe el artículo, su estado, y cualquier detalle importante."
                  {...register('description')}
                  disabled={isSubmitting}
                />
                 {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ropa">Ropa</SelectItem>
                          <SelectItem value="Útiles">Útiles</SelectItem>
                          <SelectItem value="Tecnología">Tecnología</SelectItem>
                          <SelectItem value="Libros">Libros</SelectItem>
                          <SelectItem value="Uniformes">Uniformes</SelectItem>
                          <SelectItem value="Calzado">Calzado</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="condition">Condición</Label>
                  <Controller
                    name="condition"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                        <SelectTrigger id="condition">
                          <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Nuevo">Nuevo</SelectItem>
                          <SelectItem value="Como nuevo">Como nuevo</SelectItem>
                          <SelectItem value="Usado">Usado</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.condition && <p className="text-sm text-destructive">{errors.condition.message}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="grade-level">Nivel Escolar</Label>
                  <Controller
                    name="gradeLevel"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                        <SelectTrigger id="grade-level">
                          <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Preescolar">Preescolar</SelectItem>
                          <SelectItem value="Primaria">Primaria</SelectItem>
                          <SelectItem value="Secundaria">Secundaria</SelectItem>
                          <SelectItem value="Todos">Todos</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.gradeLevel && <p className="text-sm text-destructive">{errors.gradeLevel.message}</p>}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="imageUrl">URL de la Foto del Artículo</Label>
                <Input id="imageUrl" type="url" {...register('imageUrl')} disabled={isSubmitting} placeholder="https://ejemplo.com/imagen.jpg" />
                <p className="text-xs text-muted-foreground">Pega la URL de una foto clara del artículo.</p>
                {errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl.message as string}</p>}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button size="lg" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Publicando...' : 'Publicar Artículo'}
            </Button>
          </CardFooter>
        </form>
      </Card>
  );
}

function EditItemForm({ item, onFormSubmit, onCancel }: { item: Item, onFormSubmit: () => void, onCancel: () => void }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: item.title,
      description: item.description,
      category: item.category,
      condition: item.condition,
      gradeLevel: item.gradeLevel,
      imageUrl: item.imageUrl,
    },
  });

  const onSubmit = (data: FormData) => {
    if (!firestore) return;

    setIsSubmitting(true);
    const itemRef = doc(firestore, 'materials', item.id);
    const updateData = {
      ...data,
    };

    updateDoc(itemRef, updateData).then(() => {
      toast({
        title: '¡Artículo actualizado!',
        description: 'Los cambios han sido guardados.',
      });
      onFormSubmit();
    }).catch((serverError) => {
      const permissionError = new FirestorePermissionError({
        path: itemRef.path,
        operation: 'update',
        requestResourceData: updateData,
      });
      errorEmitter.emit('permission-error', permissionError);
    }).finally(() => {
      setIsSubmitting(false);
    });
  };

  return (
    <DialogContent className="sm:max-w-[625px]">
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogHeader>
          <DialogTitle>Editar Artículo</DialogTitle>
          <DialogDescription>
            Realiza los cambios necesarios en la información del artículo.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-6">
          <div className="grid gap-2">
            <Label htmlFor="title">Título del Artículo</Label>
            <Input id="title" {...register('title')} disabled={isSubmitting} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              {...register('description')}
              disabled={isSubmitting}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Categoría</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ropa">Ropa</SelectItem>
                      <SelectItem value="Útiles">Útiles</SelectItem>
                      <SelectItem value="Tecnología">Tecnología</SelectItem>
                      <SelectItem value="Libros">Libros</SelectItem>
                      <SelectItem value="Uniformes">Uniformes</SelectItem>
                      <SelectItem value="Calzado">Calzado</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="condition">Condición</Label>
              <Controller
                name="condition"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                    <SelectTrigger id="condition">
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nuevo">Nuevo</SelectItem>
                      <SelectItem value="Como nuevo">Como nuevo</SelectItem>
                      <SelectItem value="Usado">Usado</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.condition && <p className="text-sm text-destructive">{errors.condition.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="grade-level">Nivel Escolar</Label>
              <Controller
                name="gradeLevel"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                    <SelectTrigger id="grade-level">
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Preescolar">Preescolar</SelectItem>
                      <SelectItem value="Primaria">Primaria</SelectItem>
                      <SelectItem value="Secundaria">Secundaria</SelectItem>
                      <SelectItem value="Todos">Todos</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.gradeLevel && <p className="text-sm text-destructive">{errors.gradeLevel.message}</p>}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="imageUrl">URL de la Foto del Artículo</Label>
            <Input id="imageUrl" type="url" {...register('imageUrl')} disabled={isSubmitting} />
            <p className="text-xs text-muted-foreground">Pega la URL de una foto clara del artículo.</p>
            {errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl.message as string}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancelar</Button>
          <Button size="lg" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}


function ItemRequests({ item, requestFilter, onAction }: { item: Item, requestFilter: Solicitud['status'] | 'all', onAction: () => void }) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const requestsQuery = useMemoFirebase(() => {
    if (!firestore || !item) return null;
    let q = query(collection(firestore, 'materials', item.id, 'requests'));
    if (requestFilter !== 'all') {
      q = query(q, where('status', '==', requestFilter));
    }
     // Show pending requests for assigned items as well.
    if(item.status === 'Asignado'){
        q = query(collection(firestore, 'materials', item.id, 'requests'));
    }

    return q;
  }, [firestore, item, requestFilter]);

  const { data: requests, isLoading } = useCollection<Solicitud>(requestsQuery);

  const assignItem = async (solicitudId: string) => {
    if (!firestore || !item) return;

    const itemRef = doc(firestore, 'materials', item.id);
    const updateData = {
      status: 'Asignado' as const,
      asignadoA: solicitudId,
    };
    
    updateDoc(itemRef, updateData).then(() => {
        toast({
          title: 'Artículo Asignado',
          description: `El artículo ha sido asignado a la solicitud ${solicitudId.substring(0,5)}...`,
        });
        onAction();
    }).catch((serverError) => {
        const permissionError = new FirestorePermissionError({
            path: itemRef.path,
            operation: 'update',
            requestResourceData: updateData
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };

  const unassignItem = async () => {
    if (!firestore || !item) return;

    const itemRef = doc(firestore, 'materials', item.id);
    const updateData = {
      status: 'Disponible' as const,
      asignadoA: '',
    };
    
    updateDoc(itemRef, updateData).then(() => {
        toast({
          title: 'Artículo Desasignado',
          description: 'El artículo está disponible nuevamente.',
        });
        onAction();
    }).catch((serverError) => {
        const permissionError = new FirestorePermissionError({
            path: itemRef.path,
            operation: 'update',
            requestResourceData: updateData
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  }

  const rejectRequest = async (solicitudId: string) => {
    if(!firestore || !item) return;
    
    const requestRef = doc(firestore, 'materials', item.id, 'requests', solicitudId);
    const updateData = { status: 'Rechazada' as const };

    updateDoc(requestRef, updateData).then(() => {
        toast({
            title: 'Solicitud Rechazada',
            description: 'La solicitud ha sido marcada como rechazada.'
        });
        onAction();
    }).catch((e) => {
        const permissionError = new FirestorePermissionError({
            path: requestRef.path,
            operation: 'update',
            requestResourceData: updateData
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };
  
  if (isLoading) return <p className="text-sm text-center text-muted-foreground py-4">Cargando solicitudes...</p>
  if (!requests || requests.length === 0) {
    if (requestFilter === 'all' || requestFilter === 'Pendiente') return <p className="text-sm text-center text-muted-foreground py-4">No hay solicitudes pendientes para este artículo.</p>;
    return null;
  }

  const finalRequests = item.status === 'Asignado'
    ? requests.filter(r => r.status === 'Pendiente' || r.id === item.asignadoA)
    : requests;
    
  if (finalRequests.length === 0) {
     return <p className="text-sm text-center text-muted-foreground py-4">No hay solicitudes para mostrar.</p>;
  }

  return (
    <div className="space-y-4">
      {finalRequests.map(request => (
        <Card key={request.id} className={cn(
            "bg-muted/50",
            item.asignadoA === request.id && "border-primary ring-1 ring-primary"
        )}>
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p><strong>Solicitante:</strong> {request.nombreCompleto}</p>
              <p className="text-sm text-muted-foreground"><strong>Dirección:</strong> {request.direccion}</p>
              <p className="text-sm text-muted-foreground"><strong>Teléfono:</strong> {request.telefono}</p>
               <p className="text-xs text-muted-foreground mt-1"><strong>ID Solicitud:</strong> {request.id}</p>
            </div>
            <div className='flex gap-2 self-end sm:self-center'>
             {item.status === 'Disponible' && request.status === 'Pendiente' && (
                <>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm">Asignar</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Confirmar asignación?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción marcará el artículo como "Asignado" a este solicitante y lo retirará del catálogo público. Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => assignItem(request.id)}>Confirmar Asignación</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline">Rechazar</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Rechazar esta solicitud?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción marcará la solicitud como 'Rechazada' y ya no se mostrará como pendiente. No se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => rejectRequest(request.id)} className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>Confirmar Rechazo</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                </>
             )}
             {item.status === 'Asignado' && item.asignadoA === request.id && (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">Desasignar</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Desasignar este artículo?</AlertDialogTitle>
                        <AlertDialogDescription>
                          El artículo volverá a estar "Disponible" y podrás asignarlo a otra persona.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={unassignItem}>Confirmar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
             )}
             </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ItemRequestHistory({ allAdminItems, isLoading, error, onAction }: { allAdminItems: Item[] | null, isLoading: boolean, error: Error | null, onAction: () => void }) {
    const [activeTab, setActiveTab] = useState('requests');

    if (isLoading) return <p className="text-center py-8">Cargando artículos...</p>;
    if (error) return <p className="text-center text-destructive py-8">Error al cargar los artículos.</p>;

    const assignedItems = allAdminItems?.filter(item => item.status === 'Asignado') || [];
    const pendingItems = allAdminItems?.filter(item => item.status === 'Disponible' && item.solicitudes > 0) || [];
    const rejectedItems = allAdminItems?.filter(item => item.solicitudes > 0) || [];
    
    const renderAccordion = (items: Item[], requestFilter: Solicitud['status'] | 'all') => {
        if (items.length === 0) {
            return <p className="text-center text-muted-foreground py-8">No hay elementos en esta categoría.</p>;
        }
        return (
            <Accordion type="single" collapsible className="w-full">
                {items.map(item => {
                    const assignedRequest = requestFilter === 'all' && item.status === 'Asignado' 
                        ? assignedItems.find(i => i.id === item.id)?.asignadoA || 'N/A'
                        : 'N/A';
                    
                    return (
                        <AccordionItem value={item.id} key={item.id}>
                            <AccordionTrigger>
                                <div className="flex items-center justify-between w-full text-left">
                                    <div className='flex items-center gap-4'>
                                        <img src={item.imageUrl} alt={item.title} className="w-16 h-16 object-cover rounded-md" />
                                        <div>
                                            <p className="font-semibold">{item.title}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {item.status === 'Asignado'
                                                  ? `Asignado`
                                                  : `${item.solicitudes} solicitud(es)`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`mr-4 text-xs font-semibold px-2 py-1 rounded-full ${item.status === 'Disponible' ? 'bg-green-600/20 text-green-800' : 'bg-destructive/20 text-destructive'}`}>
                                        {item.status}
                                    </span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <ItemRequests item={item} requestFilter={requestFilter} onAction={onAction}/>
                            </AccordionContent>
                        </AccordionItem>
                    )
                })}
            </Accordion>
        );
    }
    
    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="requests">Pendientes ({pendingItems.length})</TabsTrigger>
                <TabsTrigger value="assigned">Asignados ({assignedItems.length})</TabsTrigger>
                <TabsTrigger value="rejected">Rechazadas</TabsTrigger>
            </TabsList>
            <TabsContent value="requests">
                <Card>
                    <CardHeader>
                        <CardTitle>Solicitudes Pendientes</CardTitle>
                        <CardDescription>Artículos con solicitudes nuevas que requieren tu atención.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       {renderAccordion(pendingItems, 'Pendiente')}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="assigned">
                <Card>
                    <CardHeader>
                        <CardTitle>Artículos Asignados</CardTitle>
                        <CardDescription>Historial de artículos que ya han sido donados.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {renderAccordion(assignedItems, 'all')}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="rejected">
                <Card>
                    <CardHeader>
                        <CardTitle>Solicitudes Rechazadas</CardTitle>
                        <CardDescription>Historial de solicitudes que han sido rechazadas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       {renderAccordion(rejectedItems, 'Rechazada')}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const isAdmin = user?.email === 'jhelenandreat@gmail.com';

  useEffect(() => {
    if (!isUserLoading && !user) {
      toast({
        title: 'Acceso denegado',
        description: 'Debes iniciar sesión para ver esta página.',
        variant: 'destructive',
      });
      router.push('/login');
    }
  }, [user, isUserLoading, router, toast]);

  const userItemsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'materials')); // Admin sees all materials
  }, [firestore, user?.uid, refreshKey]);

  const { data: userItems, isLoading: userItemsLoading, error: userItemsError } = useCollection<Item>(userItemsQuery);

  const handleDeleteItem = async (itemId: string) => {
    if (!firestore) return;
    const itemRef = doc(firestore, 'materials', itemId);
    
    deleteDoc(itemRef).then(() => {
        toast({
            title: 'Artículo eliminado',
            description: 'Tu publicación ha sido eliminada con éxito.'
        });
        setRefreshKey(prev => prev + 1);
    }).catch((serverError) => {
        const permissionError = new FirestorePermissionError({
            path: itemRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  }

  const handleAction = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  const handleEdit = (item: Item) => {
    setEditingItem(item);
  };

  const handleEditFormSubmit = () => {
    setEditingItem(null);
    handleAction();
  };

  if (isUserLoading || !user) {
    return <div className="container text-center py-20">Cargando...</div>;
  }
  
  if(!isAdmin) {
    return (
        <div className="container text-center py-20">
            <h1 className="text-2xl font-bold">Acceso Denegado</h1>
            <p>Esta página es solo para administradores.</p>
            <Button onClick={() => router.push('/')} className="mt-4">Volver al Inicio</Button>
        </div>
    )
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  const allItemsCount = userItems?.length || 0;


  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
        <Avatar className="w-24 h-24 border-4 border-primary">
          <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.email}/100/100`} />
          <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
        </Avatar>
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-bold font-headline">{user.displayName}</h1>
          <p className="text-muted-foreground mt-1">Administrador de la Plataforma</p>
          <div className="flex gap-4 mt-4 justify-center md:justify-start">
             <div className="text-center">
                <p className="text-2xl font-bold">{allItemsCount}</p>
                <p className="text-sm text-muted-foreground">Artículos en Plataforma</p>
             </div>
          </div>
        </div>
        <Button variant="outline" className="ml-auto" onClick={() => toast({ title: 'Próximamente', description: '¡Pronto podrás editar tu perfil!'})}>Editar Perfil</Button>
      </div>

      <Tabs defaultValue="post-item" onValueChange={() => setRefreshKey(prev => prev + 1)}>
        <TabsList className="grid w-full grid-cols-3 max-w-3xl mx-auto">
          <TabsTrigger value="post-item">Publicar</TabsTrigger>
          <TabsTrigger value="listings">Publicaciones</TabsTrigger>
          <TabsTrigger value="requests">Solicitudes</TabsTrigger>
        </TabsList>
        <TabsContent value="post-item" className="mt-6">
          <PostItemForm onFormSubmit={handleAction} />
        </TabsContent>
        <TabsContent value="listings">
          <Card>
            <CardHeader>
              <CardTitle>Artículos Publicados</CardTitle>
              <CardDescription>
                Aquí puedes ver y gestionar todos los artículos en la plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userItemsLoading && <p className="text-center">Cargando tus artículos...</p>}
              {!userItemsLoading && userItems && userItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userItems.map(item => <ItemCard key={item.id} item={item} showDelete={true} onDelete={handleDeleteItem} showEdit={true} onEdit={handleEdit} />)}
                </div>
              ) : (
                !userItemsLoading && <p className="text-center text-muted-foreground">Aún no se han publicado artículos.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="requests" className="mt-6">
           <ItemRequestHistory allAdminItems={userItems} isLoading={userItemsLoading} error={userItemsError} onAction={handleAction}/>
        </TabsContent>
      </Tabs>
      
      <Dialog open={!!editingItem} onOpenChange={(isOpen) => !isOpen && setEditingItem(null)}>
        {editingItem && <EditItemForm item={editingItem} onFormSubmit={handleEditFormSubmit} onCancel={() => setEditingItem(null)} />}
      </Dialog>
    </div>
  );
}

    