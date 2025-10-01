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
import { items } from '@/lib/mock-data';
import { ArrowRight, Search } from 'lucide-react';
import { SuggestedItems } from '@/components/suggested-items';

export default function Home() {
  const availableItems = items.filter(item => !item.isReserved);

  return (
    <div className="flex flex-col">
      <section className="w-full py-20 md:py-32 bg-card border-b">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter mb-4">
            Dona y encuentra material escolar
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
            Conectamos a quienes necesitan con quienes desean ayudar. Publica, busca y reserva útiles, libros y uniformes de forma fácil y segura.
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
                <Input placeholder="Buscar por palabra clave..." className="pl-10 w-full" />
              </div>
              <Select>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  <SelectItem value="utiles">Útiles escolares</SelectItem>
                  <SelectItem value="libros">Libros</SelectItem>
                  <SelectItem value="uniformes">Uniformes</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Condición" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Cualquier condición</SelectItem>
                  <SelectItem value="nuevo">Nuevo</SelectItem>
                  <SelectItem value="como-nuevo">Como nuevo</SelectItem>
                  <SelectItem value="usado">Usado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {availableItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
