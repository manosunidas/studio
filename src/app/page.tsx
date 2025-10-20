
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
import { SuggestedItems } from '@/components/suggested-items';
import { useState } from 'react';
import type { ItemCategory, ItemCondition, Item, ItemStatus } from '@/lib/types';
import { useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';


export default function Home() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<ItemCategory | 'all'>('all');
  const [condition, setCondition] = useState<ItemCondition | 'all'>('all');
  const [status, setStatus] = useState<ItemStatus | 'all'>('Disponible');

  const itemsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // Fetch all items, filtering will happen client-side
    let q = query(collection(firestore, 'materials'));
    return q;
  }, [firestore]);

  const { data: items, isLoading } = useCollection<Item>(itemsQuery);

  const filteredItems = (items || []).filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'all' || item.category === category;
    const matchesCondition = condition === 'all' || item.condition === condition;
    const matchesStatus = status === 'all' || item.status === status;
    
    return matchesSearch && matchesCategory && matchesCondition && matchesStatus;
  });

  return (
    <div className="flex flex-col">
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

      <SuggestedItems />

      <section id="catalog" className="w-full py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col gap-8">
            <div className="space-y-4 text-center">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">Catálogo de Artículos</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Busca lo que necesitas o explora las donaciones disponibles en nuestra comunidad.
              </p>
            </div>

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

            {isLoading && <p className="text-center text-muted-foreground col-span-full">Cargando artículos...</p>}
            
            {!isLoading && filteredItems.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
             
             {!isLoading && filteredItems.length === 0 && (
                <p className="text-center text-muted-foreground col-span-full">No se encontraron artículos que coincidan con tu búsqueda.</p>
              )}
          </div>
        </div>
      </section>
    </div>
  );
}
