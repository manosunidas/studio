'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import { notFound, useRouter, useParams } from 'next/navigation';
import { useItems } from '@/hooks/use-items';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, User, MapPin, Tag, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Item } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';

export default function ItemPage() {
  const params = useParams();
  const { items, updateItem } = useItems();
  const { user } = useAuth();
  const [item, setItem] = useState<Item | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;

  useEffect(() => {
    if (!id || items.length === 0) return;
    const foundItem = items.find((i) => i.id === id);
    if (foundItem) {
      setItem(foundItem);
    } else {
      // notFound();
    }
  }, [items, id]);

  const handleReserve = () => {
    if (!item) return;
     if (!user) {
      toast({
        title: 'Inicia sesión para reservar',
        description: 'Debes iniciar sesión para poder reservar un artículo.',
        variant: 'destructive',
      });
      router.push('/login');
      return;
    }
    const updatedItem = { ...item, isReserved: true, reservedBy: user.email };
    updateItem(item.id, updatedItem);
    setItem(updatedItem);
    toast({
        title: '¡Artículo reservado!',
        description: 'Has reservado este artículo con éxito.',
    });
  };

  if (!item) {
    return <div className="container text-center py-20">Cargando artículo...</div>;
  }

  const isOwner = user?.email === item.postedBy;
  const canReserve = !item.isReserved && !isOwner;

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
                  <Button onClick={handleReserve} size="lg" disabled={!canReserve}>
                    <Heart className="mr-2 h-5 w-5" />
                    {item.isReserved ? 'Reservado' : 'Reservar'}
                  </Button>
                </div>
            </div>
            <p className="text-lg text-muted-foreground mt-2">
              Publicado por <span className="font-semibold text-primary">{item.postedBy.split('@')[0]}</span>
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
           {item.isReserved && (
            <div className="p-4 bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700 rounded-lg text-center text-yellow-800 dark:text-yellow-200">
              {item.reservedBy === user?.email ? 'Has reservado este artículo.' : `Reservado por ${item.reservedBy?.split('@')[0]}`}
            </div>
          )}
           {isOwner && (
             <div className="p-4 bg-blue-100 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-700 rounded-lg text-center text-blue-800 dark:text-blue-200">
              Eres el propietario de este artículo.
            </div>
           )}
        </div>
      </div>
    </div>
  );
}
