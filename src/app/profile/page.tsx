'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
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
import { collection, query, doc, deleteDoc, serverTimestamp, addDoc, updateDoc } from 'firebase/firestore';
import type { Item } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from '@/components/ui/switch';


const itemFormSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  description: z.string().min(1, 'La descripción es obligatoria'),
  category: z.enum(['Ropa', 'Útiles', 'Tecnología', 'Libros', 'Uniformes', 'Calzado'], { required_error: 'Selecciona una categoría' }),
  condition: z.enum(['Nuevo', 'Como nuevo', 'Usado'], { required_error: 'Selecciona la condición' }),
  gradeLevel: z.enum(['Preescolar', 'Primaria', 'Secundaria', 'Todos'], { required_error: 'Selecciona el nivel escolar' }),
  imageUrl: z.string().url('Por favor, introduce una URL de imagen válida.').min(1, 'La URL de la imagen es obligatoria.'),
});

type ItemFormData = z.infer<typeof itemFormSchema>;

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
      toast({
        variant: 'destructive',
        title: 'Error de Permiso',
        description: 'No tienes permisos para crear artículos.'
      })
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
      toast({
        variant: 'destructive',
        title: 'Error de Permiso',
        description: 'No tienes permisos para editar este artículo.'
      });
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

  const { data: userItems, isLoading: userItemsLoading } = useCollection<Item>(userItemsQuery);

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
        toast({
          variant: 'destructive',
          title: 'Error de Permiso',
          description: 'No tienes permiso para eliminar este artículo.'
        });
    });
  }

  const handleToggleStatus = async (item: Item) => {
    if (!firestore) return;
    const newStatus = item.status === 'Disponible' ? 'Asignado' : 'Disponible';
    const itemRef = doc(firestore, 'materials', item.id);
    const updateData = { status: newStatus };

    updateDoc(itemRef, updateData).then(() => {
      toast({
        title: 'Estado Actualizado',
        description: `El artículo ahora está ${newStatus.toLowerCase()}.`
      });
      handleAction();
    }).catch((serverError) => {
      const permissionError = new FirestorePermissionError({
          path: itemRef.path,
          operation: 'update',
          requestResourceData: updateData
      });
      errorEmitter.emit('permission-error', permissionError);
       toast({
          variant: 'destructive',
          title: 'Error de Permiso',
          description: 'No tienes permiso para cambiar el estado de este artículo.'
        });
    });
  };

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

      <Tabs defaultValue="listings" onValueChange={() => handleAction()}>
        <TabsList className="grid w-full grid-cols-2 max-w-xl mx-auto">
          <TabsTrigger value="listings">Gestionar Artículos</TabsTrigger>
          <TabsTrigger value="post-item">Publicar Nuevo</TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="mt-6">
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
                  {userItems.map(item => (
                    <div key={item.id} className="flex flex-col">
                      <ItemCard item={item} showDelete={true} onDelete={handleDeleteItem} showEdit={true} onEdit={handleEdit} />
                      <div className="flex items-center justify-center space-x-2 p-3 bg-muted rounded-b-lg">
                          <Label htmlFor={`status-switch-${item.id}`} className={item.status === 'Disponible' ? 'text-green-600' : 'text-destructive'}>
                            {item.status}
                          </Label>
                          <Switch
                            id={`status-switch-${item.id}`}
                            checked={item.status === 'Asignado'}
                            onCheckedChange={() => handleToggleStatus(item)}
                          />
                      </div>
                    </div>
                  ))}
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
