
'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { ItemCard } from './item-card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import type { Item } from '@/lib/types';


export function AssignedItemsCarousel() {
  const firestore = useFirestore();
  const assignedItemsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'materials'), 
      where('status', '==', 'Asignado'), 
      limit(8)
    );
  }, [firestore]);

  const { data: assignedItems, isLoading } = useCollection<Item>(assignedItemsQuery);
  
  if (isLoading || !assignedItems || assignedItems.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-16 md:py-24 bg-card">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col gap-8">
            <div className="space-y-2 text-center">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">Nuestra Labor en Acción</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Estos son algunos de los artículos que ya han encontrado un nuevo hogar gracias a la generosidad de nuestra comunidad. ¡Tú también puedes ser parte del cambio!
              </p>
            </div>
            <Carousel
                opts={{
                    align: "start",
                    loop: assignedItems.length > 4, // Only loop if there are enough items to scroll
                }}
                className="w-full"
            >
                <CarouselContent>
                    {assignedItems.map((item) => (
                        <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                             <ItemCard item={item} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="ml-12" />
                <CarouselNext className="mr-12" />
            </Carousel>
        </div>
      </div>
    </section>
  );
}
