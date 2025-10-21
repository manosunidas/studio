'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, useForm as useGenericForm, SubmitHandler } from 'react-hook-form';
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
import { incrementSolicitudes } from '@/app/actions';


const itemFormSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  description: z.string().min(1, 'La descripción es obligatoria'),
  category: z.enum(['Ropa', 'Útiles', 'Tecnología', 'Libros', 'Uniformes', 'Calzado'], { required_error: 'Selecciona una categoría' }),
  condition: z.enum(['Nuevo', 'Como nuevo', 'Usado'], { required_error: 'Selecciona la condición' }),
  gradeLevel: z.enum(['Preescolar', 'Primaria', 'Secundaria', 'Todos'], { required_error: 'Selecciona el nivel escolar' }),
  imageUrl: z.string().url('Por favor, introduce una URL de imagen válida.').min(1, 'La URL de la imagen es obligatoria.'),
});

type ItemFormData = z.infer<typeof itemFormSchema>;

const requestSchema = z.object({
  nombreCompleto: z.string().min(3, 'El nombre es obligatorio'),
  direccion: z.string().min(5, 'La dirección es obligatoria'),
  telefono: z.string().min(7, 'El teléfono es obligatorio'),
});

type RequestFormData = z.infer<typeof requestSchema>;

function PostItemForm({ onFormSubmit }: { onFormSubmit: () => void }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<ItemFormData>({
    resolver: zodResolver(itemFormSchema),
  });

  const onSubmit = (data: ItemFormData) => {
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

  const { register, handleSubmit, control, formState: { errors } } = useForm<ItemFormData>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      title: item.title,
      description: item.description,
      category: item.category,
      condition: item.condition,
      gradeLevel: item.gradeLevel,
      imageUrl: item.imageUrl,
    },
  });

  const onSubmit = (data: ItemFormData) => {
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


function ItemRequests({ item, onAction }: { item: Item, onAction: () => void }) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [showAddRequestForm, setShowAddRequestForm] = useState(false);
  
  const requestsQuery = useMemoFirebase(() => {
    if (!firestore || !item) return null;
    return query(collection(firestore, 'materials', item.id, 'requests'));
  }, [firestore, item]);

  const { data: requests, isLoading } = useCollection<Solicitud>(requestsQuery);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useGenericForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
  });

  const handleAddRequest: SubmitHandler<RequestFormData> = async (data) => {
    if (!firestore || !user) return;
    
    const requestsCollectionRef = collection(firestore, 'materials', item.id, 'requests');
    const newRequestData = {
        ...data,
        materialId: item.id,
        fechaSolicitud: serverTimestamp(),
        status: 'Pendiente' as const,
        solicitanteId: 'admin', // Admin is creating this on behalf of someone
    };

    addDoc(requestsCollectionRef, newRequestData)
      .then(async () => {
          await incrementSolicitudes(item.id);
          toast({
              title: '¡Solicitud registrada!',
              description: 'La solicitud ha sido añadida al artículo.',
          });
          reset();
          setShowAddRequestForm(false);
          onAction();
      })
      .catch((serverError) => {
          const permissionError = new FirestorePermissionError({
              path: requestsCollectionRef.path,
              operation: 'create',
              requestResourceData: newRequestData,
          });
          errorEmitter.emit('permission-error', permissionError);
      });
  };

  const assignItem = async (solicitud: Solicitud) => {
    if (!firestore || !item) return;

    const itemRef = doc(firestore, 'materials', item.id);
    const updateData = {
      status: 'Asignado' as const,
      asignadoA: solicitud.id,
    };
    
    updateDoc(itemRef, updateData).then(() => {
        toast({
          title: 'Artículo Asignado',
          description: `El artículo ha sido asignado a ${solicitud.nombreCompleto}.`,
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
    
    deleteDoc(requestRef).then(async () => {
        await incrementSolicitudes(item.id);
        toast({
            title: 'Solicitud Eliminada',
            description: 'La solicitud ha sido eliminada permanentemente.'
        });
        onAction(); // This will refetch everything
    }).catch((e) => {
        const permissionError = new FirestorePermissionError({
            path: requestRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };
  
  if (isLoading) return <p className="text-sm text-center text-muted-foreground py-4">Cargando solicitudes...</p>
  
  const assignedRequest = requests?.find(r => r.id === item.asignadoA);
  const pendingRequests = requests?.filter(r => r.id !== item.asignadoA) || [];

  return (
    <div className="space-y-4">
      {item.status === 'Asignado' && assignedRequest ? (
         <Card key={assignedRequest.id} className="border-primary ring-1 ring-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Asignado a:</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p><strong>Solicitante:</strong> {assignedRequest.nombreCompleto}</p>
              <p className="text-sm text-muted-foreground"><strong>Dirección:</strong> {assignedRequest.direccion}</p>
              <p className="text-sm text-muted-foreground"><strong>Teléfono:</strong> {assignedRequest.telefono}</p>
               <p className="text-xs text-muted-foreground mt-1"><strong>ID Solicitud:</strong> {assignedRequest.id}</p>
            </div>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive" className="self-end sm:self-center">Desasignar</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Desasignar este artículo?</AlertDialogTitle>
                    <AlertDialogDescription>
                      El artículo volverá a estar "Disponible" y podrás asignarlo a otra persona. La solicitud actual se conservará.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={unassignItem}>Confirmar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      ) : (
        <div className="p-4 border-dashed border-2 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-2">Este artículo está disponible. Registra una nueva solicitud recibida.</p>
            <Button size="sm" onClick={() => setShowAddRequestForm(true)}>+ Registrar Nueva Solicitud</Button>
        </div>
      )}

      {pendingRequests.length > 0 && <h4 className="font-semibold pt-4">Otras Solicitudes Pendientes:</h4>}
      {pendingRequests.map(request => (
        <Card key={request.id} className="bg-muted/50">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p><strong>Solicitante:</strong> {request.nombreCompleto}</p>
              <p className="text-sm text-muted-foreground"><strong>Dirección:</strong> {request.direccion}</p>
              <p className="text-sm text-muted-foreground"><strong>Teléfono:</strong> {request.telefono}</p>
               <p className="text-xs text-muted-foreground mt-1"><strong>ID Solicitud:</strong> {request.id}</p>
            </div>
            <div className='flex gap-2 self-end sm:self-center'>
             {item.status === 'Disponible' && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm">Asignar</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Confirmar asignación?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción marcará el artículo como "Asignado" a este solicitante y lo retirará del catálogo público.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => assignItem(request)}>Confirmar Asignación</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
             )}
              <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline">Rechazar</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Rechazar esta solicitud?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción eliminará la solicitud permanentemente y actualizará el contador de solicitudes del artículo.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => rejectRequest(request.id)} className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>Confirmar Rechazo</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
              </AlertDialog>
             </div>
          </CardContent>
        </Card>
      ))}

      {(!requests || requests.length === 0) && item.status === 'Disponible' && !showAddRequestForm && (
         <p className="text-sm text-center text-muted-foreground py-4">No hay solicitudes para este artículo.</p>
      )}

      <Dialog open={showAddRequestForm} onOpenChange={setShowAddRequestForm}>
        <DialogContent>
            <form onSubmit={handleSubmit(handleAddRequest)}>
                <DialogHeader>
                    <DialogTitle>Registrar Nueva Solicitud</DialogTitle>
                    <DialogDescription>
                    Registra los datos del solicitante que te contactó por fuera de la plataforma.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="nombreCompleto">Nombre Completo</Label>
                        <Input id="nombreCompleto" {...register('nombreCompleto')} />
                        {errors.nombreCompleto && <p className="text-sm text-destructive">{errors.nombreCompleto.message}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="direccion">Dirección</Label>
                        <Input id="direccion" {...register('direccion')} />
                        {errors.direccion && <p className="text-sm text-destructive">{errors.direccion.message}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="telefono">Teléfono</Label>
                        <Input id="telefono" {...register('telefono')} />
                        {errors.telefono && <p className="text-sm text-destructive">{errors.telefono.message}</p>}
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowAddRequestForm(false)}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Registrando...' : 'Registrar Solicitud'}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ItemRequestHistory({ allAdminItems, isLoading, error, onAction }: { allAdminItems: Item[] | null, isLoading: boolean, error: Error | null, onAction: () => void }) {
    const [activeTab, setActiveTab] = useState('requests');

    if (isLoading) return <p className="text-center py-8">Cargando artículos...</p>;
    if (error) return <p className="text-center text-destructive py-8">Error al cargar los artículos.</p>;

    const assignedItems = allAdminItems?.filter(item => item.status === 'Asignado') || [];
    const pendingItems = allAdminItems?.filter(item => item.status === 'Disponible' && item.solicitudes > 0) || [];
    
    const renderAccordion = (items: Item[]) => {
        if (items.length === 0) {
            return <p className="text-center text-muted-foreground py-8">No hay elementos en esta categoría.</p>;
        }
        return (
            <Accordion type="single" collapsible className="w-full">
                {items.map(item => {
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
                                <ItemRequests item={item} onAction={onAction}/>
                            </AccordionContent>
                        </AccordionItem>
                    )
                })}
            </Accordion>
        );
    }
    
    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="requests">Pendientes ({pendingItems.length})</TabsTrigger>
                <TabsTrigger value="assigned">Asignados ({assignedItems.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="requests">
                <Card>
                    <CardHeader>
                        <CardTitle>Solicitudes Pendientes</CardTitle>
                        <CardDescription>Artículos con solicitudes que requieren tu atención.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       {renderAccordion(pendingItems)}
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
                        {renderAccordion(assignedItems)}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isUserLoading, isAdmin } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  useEffect(() => {
    if (!isUserLoading && (!user || user.isAnonymous || !isAdmin)) {
      toast({
        title: 'Acceso denegado',
        description: 'Debes iniciar sesión como administrador para ver esta página.',
        variant: 'destructive',
      });
      router.push('/login');
    }
  }, [user, isUserLoading, isAdmin, router, toast]);

  const userItemsQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return query(collection(firestore, 'materials')); // Admin sees all materials
  }, [firestore, isAdmin, refreshKey]);

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

  const handleAction = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);
  
  const handleEdit = (item: Item) => {
    setEditingItem(item);
  };

  const handleEditFormSubmit = () => {
    setEditingItem(null);
    handleAction();
  };

  if (isUserLoading || !user || !isAdmin) {
    return <div className="container text-center py-20">Cargando...</div>;
  }
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'A';
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

      <Tabs defaultValue="requests" onValueChange={() => handleAction()}>
        <TabsList className="grid w-full grid-cols-3 max-w-3xl mx-auto">
          <TabsTrigger value="requests">Solicitudes</TabsTrigger>
          <TabsTrigger value="listings">Publicaciones</TabsTrigger>
          <TabsTrigger value="post-item">Publicar Nuevo</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-6">
           <ItemRequestHistory allAdminItems={userItems} isLoading={userItemsLoading} error={userItemsError} onAction={handleAction}/>
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

        <TabsContent value="post-item" className="mt-6">
          <PostItemForm onFormSubmit={handleAction} />
        </TabsContent>

      </Tabs>
      
      <Dialog open={!!editingItem} onOpenChange={(isOpen) => !isOpen && setEditingItem(null)}>
        {editingItem && <EditItemForm item={editingItem} onFormSubmit={handleEditFormSubmit} onCancel={() => setEditingItem(null)} />}
      </Dialog>
    </div>
  );
}
