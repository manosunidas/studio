'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { ItemCard } from './item-card';
import { useItems } from '@/hooks/use-items';

export function SuggestedItems() {
  const { items } = useItems();
  
  // In a real app, this data would come from an AI recommendation engine.
  // For now, we'll take a few available items.
  const suggestedItems = items.filter(item => !item.isReserved).slice(0, 8);
  
  if (suggestedItems.length === 0) {
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
