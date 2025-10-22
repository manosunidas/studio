
import Image from 'next/image';
import Link from 'next/link';
import type { Item } from '@/lib/types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Trash2, Pencil } from 'lucide-react';
import { useUser } from '@/firebase';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ItemCardProps {
  item: Item;
  showDelete?: boolean;
  onDelete?: (id: string) => void;
  showEdit?: boolean;
  onEdit?: (item: Item) => void;
}

export function ItemCard({ item, showDelete = false, onDelete, showEdit = false, onEdit }: ItemCardProps) {
  const { isAdmin } = useUser();

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="relative p-0 flex-shrink-0">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-md">
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            data-ai-hint={item.imageHint}
          />
           <div className="absolute top-2 left-2">
              {item.status === 'Asignado' ? (
                <Badge variant="destructive">Asignado</Badge>
              ) : (
                <Badge variant="default" className="bg-green-600 hover:bg-green-700">Disponible</Badge>
              )}
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="text-lg leading-tight mb-2">{item.title}</CardTitle>
        <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="secondary">{item.category}</Badge>
            <Badge variant="outline">{item.condition}</Badge>
        </div>
      </CardContent>
      <CardFooter className="flex flex-shrink-0 gap-2 p-4 pt-0">
        <Button asChild variant="secondary" className="w-full">
          <Link href={`/items/${item.id}`}>
            Ver Detalles <ArrowRight className="ml-2" />
          </Link>
        </Button>
         {isAdmin && showEdit && onEdit && (
            <Button variant="outline" size="icon" title="Editar artículo" onClick={() => onEdit(item)}>
              <Pencil />
            </Button>
         )}
         {isAdmin && showDelete && onDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon" title="Eliminar artículo">
                <Trash2 />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará permanentemente la publicación de este artículo. No se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(item.id)}>Eliminar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardFooter>
    </Card>
  );
}
