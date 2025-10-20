'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ItemCard } from '@/components/item-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, deleteDoc } from 'firebase/firestore';
import type { Item } from '@/lib/types';


export default function ProfilePage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && !user) {
      toast({
        title: 'Acceso denegado',
        description: 'Debes iniciar sesión para ver tu perfil.',
        variant: 'destructive',
      });
      router.push('/login');
    }
  }, [user, isUserLoading, router, toast]);

  const userItemsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.email) return null;
    return query(collection(firestore, 'materials'), where('postedBy', '==', user.email));
  }, [firestore, user?.email]);

  const reservedItemsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.email) return null;
    return query(collection(firestore, 'materials'), where('reservedBy', '==', user.email));
  }, [firestore, user?.email]);

  const { data: userItems, isLoading: userItemsLoading } = useCollection<Item>(userItemsQuery);
  const { data: reservedItems, isLoading: reservedItemsLoading } = useCollection<Item>(reservedItemsQuery);

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

  if (isUserLoading || !user) {
    return <div className="container text-center py-20">Cargando perfil...</div>;
  }
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
        <Avatar className="w-24 h-24 border-4 border-primary">
          <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.email}/100/100`} />
          <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
        </Avatar>
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-bold font-headline">{user.displayName}</h1>
          <p className="text-muted-foreground mt-1">Miembro desde: {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</p>
          <div className="flex gap-4 mt-4 justify-center md:justify-start">
             <div className="text-center">
                <p className="text-2xl font-bold">{userItems?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Artículos Publicados</p>
             </div>
             <div className="text-center">
                <p className="text-2xl font-bold">{reservedItems?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Artículos Reservados</p>
             </div>
          </div>
        </div>
        <Button variant="outline" className="ml-auto" onClick={() => toast({ title: 'Próximamente', description: '¡Pronto podrás editar tu perfil!'})}>Editar Perfil</Button>
      </div>

      <Tabs defaultValue="listings">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="listings">Mis Publicaciones</TabsTrigger>
          <TabsTrigger value="reservations">Mis Reservas</TabsTrigger>
        </TabsList>
        <TabsContent value="listings">
          <Card>
            <CardHeader>
              <CardTitle>Tus Artículos Publicados</CardTitle>
              <CardDescription>
                Aquí puedes ver y gestionar los artículos que has compartido con la comunidad.
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
        <TabsContent value="reservations">
          <Card>
            <CardHeader>
              <CardTitle>Tus Artículos Reservados</CardTitle>
              <CardDescription>
                Este es un historial de los artículos que has reservado a través de la plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reservedItemsLoading && <p className="text-center">Cargando tus reservas...</p>}
              {!reservedItemsLoading && reservedItems && reservedItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {reservedItems.map(item => <ItemCard key={item.id} item={item} />)}
                </div>
              ) : (
                !reservedItemsLoading && <p className="text-center text-muted-foreground">Aún no has reservado ningún artículo.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
