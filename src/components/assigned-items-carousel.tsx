
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

/**
 * @fileoverview AssignedItemsCarousel component.
 * This component displays a carousel of items that have been successfully
 * assigned to a recipient. It serves as a showcase of the platform's impact.
 * It fetches the 8 most recent items with the status "Asignado".
 */

export function AssignedItemsCarousel() {
  const firestore = useFirestore();
  
  // Memoize the Firestore query to fetch assigned items.
  // The query fetches documents from the 'materials' collection where 'status' is 'Asignado',
  // and limits the result to 8 to keep the carousel concise.
  const assignedItemsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'materials'), 
      where('status', '==', 'Asignado'), 
      limit(8)
    );
  }, [firestore]);

  // Use the custom useCollection hook to fetch and subscribe to the query results.
  const { data: assignedItems, isLoading } = useCollection<Item>(assignedItemsQuery);
  
  // If data is loading or no assigned items are found, do not render the component.
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
                    // Only loop the carousel if there are enough items to make scrolling meaningful.
                    loop: assignedItems.length > 4,
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
