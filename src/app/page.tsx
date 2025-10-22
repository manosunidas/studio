
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ItemCard } from '@/components/item-card';
import { useCollection, useMemoFirebase } from '@/firebase';
import { ArrowRight, Search } from 'lucide-react';
import { AssignedItemsCarousel } from '@/components/assigned-items-carousel';
import { useState } from 'react';
import type { ItemCategory, ItemCondition, Item, ItemStatus } from '@/lib/types';
import { useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

/**
 * @fileoverview Home page component.
 * This is the main landing page of the application. It features a hero section,
 * a carousel of recently assigned items, and the main catalog of donation items.
 * Users can search and filter the catalog to find items they need.
 */

export default function Home() {
  const firestore = useFirestore();

  // State for managing user's filter and search inputs.
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<ItemCategory | 'all'>('all');
  const [condition, setCondition] = useState<ItemCondition | 'all'>('all');
  const [status, setStatus] = useState<ItemStatus | 'all'>('Disponible'); // Default to showing available items.

  // Memoize the Firestore query to prevent re-creating it on every render.
  // The query changes only when the `status` filter changes.
  const itemsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    let q = collection(firestore, 'materials');
    
    // Build the query constraints based on the selected status.
    const queryConstraints = [];
    if (status !== 'all') {
      queryConstraints.push(where('status', '==', status));
    }

    return query(q, ...queryConstraints);
  }, [firestore, status]);

  // Fetch the collection of items from Firestore in real-time.
  const { data: items, isLoading } = useCollection<Item>(itemsQuery);

  // Client-side filtering based on search term, category, and condition.
  // This runs after the data is fetched from Firestore.
  const filteredItems = (items || []).filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'all' || item.category === category;
    const matchesCondition = condition === 'all' || item.condition === condition;
    
    return matchesSearch && matchesCategory && matchesCondition;
  });

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full py-20 md:py-32 bg-card border-b">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-4">
            Dona y encuentra material escolar
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
            Conectamos a quienes necesitan con quienes desean ayudar. Publica, busca y solicita útiles, libros y uniformes de forma fácil y segura.
          </p>
          <div className="flex justify-center">
            <Button asChild size="lg">
              <Link href="#catalog">
                Explorar catálogo <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Assigned Items Carousel Section */}
      <AssignedItemsCarousel />

      {/* Main Item Catalog Section */}
      <section id="catalog" className="w-full py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col gap-8">
            <div className="space-y-4 text-center">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">Catálogo de Artículos</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Busca lo que necesitas o explora las donaciones disponibles en nuestra comunidad.
              </p>
            </div>

            {/* Filter and Search Controls */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Buscar por palabra clave..." 
                  className="pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select onValueChange={(value: ItemCategory | 'all') => setCategory(value)} defaultValue="all">
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  <SelectItem value="Ropa">Ropa</SelectItem>
                  <SelectItem value="Útiles">Útiles escolares</SelectItem>
                  <SelectItem value="Tecnología">Tecnología</SelectItem>
                  <SelectItem value="Libros">Libros</SelectItem>
                  <SelectItem value="Uniformes">Uniformes</SelectItem>
                  <SelectItem value="Calzado">Calzado</SelectItem>
                </SelectContent>
              </Select>
              <Select onValueChange={(value: ItemCondition | 'all') => setCondition(value)} defaultValue="all">
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Condición" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Cualquier condición</SelectItem>
                  <SelectItem value="Nuevo">Nuevo</SelectItem>
                  <SelectItem value="Como nuevo">Como nuevo</SelectItem>
                  <SelectItem value="Usado">Usado</SelectItem>
                </SelectContent>
              </Select>
               <Select onValueChange={(value: ItemStatus | 'all') => setStatus(value)} defaultValue="Disponible">
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="Disponible">Disponibles</SelectItem>
                  <SelectItem value="Asignado">Asignados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Loading Indicator */}
            {isLoading && <p className="text-center text-muted-foreground col-span-full">Cargando artículos...</p>}
            
            {/* Items Grid */}
            {!isLoading && filteredItems.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
             
             {/* No Results Message */}
             {!isLoading && filteredItems.length === 0 && (
                <p className="text-center text-muted-foreground col-span-full">No se encontraron artículos que coincidan con tu búsqueda.</p>
              )}
          </div>
        </div>
      </section>
    </div>
  );
}
