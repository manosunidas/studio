import Image from 'next/image';
import Link from 'next/link';
import type { Item } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
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
}

export function ItemCard({ item, showDelete = false, onDelete }: ItemCardProps) {
  const { user } = useAuth();
  const isOwner = user?.email === item.postedBy;

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="relative">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md">
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            data-ai-hint={item.imageHint}
          />
           {item.isReserved && (
            <div className="absolute top-2 left-2">
              <Badge variant="destructive">Reservado</Badge>
            </div>
           )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardTitle className="text-lg leading-tight mb-2">{item.title}</CardTitle>
        <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="secondary">{item.category}</Badge>
            <Badge variant="outline">{item.condition}</Badge>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button asChild variant="secondary" className="w-full">
          <Link href={`/items/${item.id}`}>
            Ver Detalles <ArrowRight className="ml-2" />
          </Link>
        </Button>
         {isOwner && showDelete && onDelete && (
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
