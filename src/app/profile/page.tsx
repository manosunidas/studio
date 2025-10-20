
'use client';

import { useEffect, useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useUser, useCollection, useFirestore, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, query, where, doc, deleteDoc, serverTimestamp, addDoc } from 'firebase/firestore';
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


const formSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  description: z.string().min(1, 'La descripción es obligatoria'),
  category: z.enum(['Ropa', 'Útiles', 'Tecnología', 'Libros', 'Uniformes'], { required_error: 'Selecciona una categoría' }),
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
        isReserved: false,
        reservedBy: '',
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

function ReservedItemsDashboard() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const { user } = useUser(); // Hook to get the current user

    const reservedItemsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'materials'), where('isReserved', '==', true));
    }, [firestore]);

    const { data: reservedItems, isLoading, error, refetch } = useCollection<Item>(reservedItemsQuery);
    
    const markAsDelivered = async (itemId: string) => {
        // Security check: ensure the user is the admin
        if (!user || user.email !== 'jhelenandreat@gmail.com' || !firestore) {
            toast({
                title: 'Acción no permitida',
                description: 'Solo el administrador puede realizar esta acción.',
                variant: 'destructive',
            });
            return;
        }

        const itemRef = doc(firestore, 'materials', itemId);
        try {
            await deleteDoc(itemRef);
            toast({
                title: '¡Entregado!',
                description: 'El artículo ha sido marcado como entregado y eliminado de la lista.',
            });
            refetch();
        } catch (e) {
             toast({
                title: 'Error',
                description: 'No se pudo actualizar el artículo. Inténtalo de nuevo.',
                variant: 'destructive',
            });
        }
    };

    if (isLoading) {
        return <p className="text-center py-8">Cargando artículos reservados...</p>;
    }
    
    if (error) {
        return <p className="text-center text-destructive py-8">Error al cargar los artículos reservados.</p>
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Artículos Reservados</CardTitle>
                <CardDescription>
                    Aquí puedes ver los artículos que han sido reservados por la comunidad. Una vez entregado, elimínalo de la lista.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {!reservedItems || reservedItems.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No hay artículos reservados por el momento.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reservedItems.map(item => (
                            <Card key={item.id} className="flex flex-col">
                                <CardHeader>
                                    <CardTitle className="text-lg">{item.title}</CardTitle>
                                    <img src={item.imageUrl} alt={item.title} className="aspect-video object-cover rounded-md mt-2" />
                                </CardHeader>
                                <CardContent className="flex-grow text-sm space-y-2">
                                    <p><strong>Reservado por:</strong> {item.reserverFullName}</p>
                                    <p><strong>Dirección:</strong> {item.reserverAddress}</p>
                                    <p><strong>Teléfono:</strong> {item.reserverPhone}</p>
                                    <p><strong>Email:</strong> {item.reservedBy}</p>
                                </CardContent>
                                <CardFooter>
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                             <Button className="w-full" variant="default">Marcar como Entregado</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Confirmar Entrega?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                            Esta acción eliminará permanentemente la publicación. Asegúrate de que el artículo ha sido entregado.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => markAsDelivered(item.id)}>Confirmar</AlertDialogAction>
                                        </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}


export default function ProfilePage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

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
    // Admin sees all items, regular user sees only their own items
    // This was the source of the bug. Regular users should not see this page at all.
    return query(collection(firestore, 'materials'), where('postedBy', '==', user.uid));
  }, [firestore, user?.uid]);

  const { data: userItems, isLoading: userItemsLoading } = useCollection<Item>(userItemsQuery);

  const handleDeleteItem = async (itemId: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'materials', itemId));
      toast({
        title: 'Artículo eliminado',
        description: 'Tu publicación ha sido eliminada con éxito.'
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: 'Error al eliminar',
        description: 'No se pudo eliminar el artículo. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    }
  }

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
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
                <p className="text-sm text-muted-foreground">Artículos Publicados</p>
             </div>
          </div>
        </div>
        <Button variant="outline" className="ml-auto" onClick={() => toast({ title: 'Próximamente', description: '¡Pronto podrás editar tu perfil!'})}>Editar Perfil</Button>
      </div>

      <Tabs defaultValue="post-item">
        <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto">
          <TabsTrigger value="post-item">Publicar Artículo</TabsTrigger>
          <TabsTrigger value="listings">Mis Publicaciones</TabsTrigger>
          <TabsTrigger value="reservations">Reservas</TabsTrigger>
        </TabsList>
        <TabsContent value="post-item" className="mt-6">
          <PostItemForm onFormSubmit={handleFormSuccess} />
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
                  {userItems.map(item => <ItemCard key={item.id} item={item} showDelete={true} onDelete={handleDeleteItem} />)}
                </div>
              ) : (
                !userItemsLoading && <p className="text-center text-muted-foreground">Aún no has publicado ningún artículo.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reservations" className="mt-6">
           <ReservedItemsDashboard key={refreshKey} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

    