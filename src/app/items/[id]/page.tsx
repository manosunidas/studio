import Image from 'next/image';
import { notFound } from 'next/navigation';
import { items } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, User, MapPin, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ItemPage({ params }: { params: { id: string } }) {
  const item = items.find((i) => i.id === params.id);

  if (!item) {
    notFound();
  }

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
            <div className="flex items-start justify-between">
                <h1 className="text-3xl md:text-4xl font-bold font-headline">{item.title}</h1>
                <Button variant={item.isReserved ? "secondary" : "default"} size="lg" disabled={item.isReserved}>
                  <Heart className="mr-2 h-5 w-5" />
                  {item.isReserved ? 'Reservado' : 'Reservar Artículo'}
                </Button>
            </div>
            <p className="text-lg text-muted-foreground mt-2">
              Publicado por <span className="font-semibold text-primary">{item.postedBy}</span>
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
              Este artículo ya ha sido reservado por otro usuario.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
