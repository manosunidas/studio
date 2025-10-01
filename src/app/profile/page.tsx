import { ItemCard } from '@/components/item-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { items } from '@/lib/mock-data';

export default function ProfilePage() {
  const userItems = items.filter(item => item.postedBy === 'Ana G.' || item.postedBy === 'Luis M.'); // Mock
  const reservedItems = items.filter(item => item.isReserved);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
        <Avatar className="w-24 h-24 border-4 border-primary">
          <AvatarImage src="https://picsum.photos/seed/user/100/100" />
          <AvatarFallback>AG</AvatarFallback>
        </Avatar>
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-bold font-headline">Ana García</h1>
          <p className="text-muted-foreground mt-1">Miembro desde: 1 de Junio, 2024</p>
          <div className="flex gap-4 mt-4 justify-center md:justify-start">
             <div className="text-center">
                <p className="text-2xl font-bold">{userItems.length}</p>
                <p className="text-sm text-muted-foreground">Artículos Publicados</p>
             </div>
             <div className="text-center">
                <p className="text-2xl font-bold">{reservedItems.length}</p>
                <p className="text-sm text-muted-foreground">Artículos Reservados</p>
             </div>
          </div>
        </div>
        <Button variant="outline" className="ml-auto">Editar Perfil</Button>
      </div>

      <Tabs defaultValue="listings">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="listings">Mis Publicaciones</TabsTrigger>
          <TabsTrigger value="reservations">Mis Reservas (Historial)</TabsTrigger>
        </TabsList>
        <TabsContent value="listings">
          <Card>
            <CardHeader>
              <CardTitle>Tus Artículos Publicados</CardTitle>
              <CardDescription>
                Aquí puedes ver y gestionar los artículos que has compartido con la comunidad.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userItems.length > 0 ? (
                userItems.map(item => <ItemCard key={item.id} item={item} />)
              ) : (
                <p>Aún no has publicado ningún artículo.</p>
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
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {reservedItems.length > 0 ? (
                reservedItems.map(item => <ItemCard key={item.id} item={item} />)
              ) : (
                <p>Aún no has reservado ningún artículo.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
