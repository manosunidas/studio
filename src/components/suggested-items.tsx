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


export function SuggestedItems() {
  const firestore = useFirestore();
  const suggestedItemsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'materials'), 
      where('isReserved', '==', false), 
      limit(8)
    );
  }, [firestore]);

  const { data: suggestedItems, isLoading } = useCollection<Item>(suggestedItemsQuery);
  
  if (isLoading || !suggestedItems || suggestedItems.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col gap-8">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">Sugerencias para ti</h2>
              <p className="text-muted-foreground">
                Basado en tus intereses, estos artículos podrían serte útiles.
              </p>
            </div>
            <Carousel
                opts={{
                    align: "start",
                    loop: suggestedItems.length > 4, // Only loop if there are enough items to scroll
                }}
                className="w-full"
            >
                <CarouselContent>
                    {suggestedItems.map((item) => (
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
