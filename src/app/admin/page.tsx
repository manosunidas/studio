'use client';

import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { useUser, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, serverTimestamp, addDoc } from 'firebase/firestore';

const formSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  description: z.string().min(1, 'La descripción es obligatoria'),
  category: z.enum(['Ropa', 'Útiles', 'Tecnología'], { required_error: 'Selecciona una categoría' }),
  condition: z.enum(['Nuevo', 'Como nuevo', 'Usado'], { required_error: 'Selecciona la condición' }),
  gradeLevel: z.enum(['Preescolar', 'Primaria', 'Secundaria', 'Todos'], { required_error: 'Selecciona el nivel escolar' }),
  imageUrl: z.string().url('Por favor, introduce una URL de imagen válida.').min(1, 'La URL de la imagen es obligatoria.'),
});

type FormData = z.infer<typeof formSchema>;

export default function AdminPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

   useEffect(() => {
    if (!isUserLoading && (!user || user.email !== 'jhelenandreat@gmail.com')) {
      toast({
        title: 'Acceso denegado',
        description: 'No tienes permiso para acceder a esta página.',
        variant: 'destructive',
      });
      router.push('/');
    }
  }, [user, isUserLoading, router, toast]);

  const onSubmit = async (data: FormData) => {
    if (!user || !firestore) return;
    
    setIsSubmitting(true);

    try {
        const materialsCollection = collection(firestore, 'materials');
        const newMaterialData = {
            title: data.title,
            description: data.description,
            category: data.category,
            condition: data.condition,
            gradeLevel: data.gradeLevel,
            imageUrl: data.imageUrl,
            imageHint: 'school supplies',
            postedBy: user.uid,
            postedByName: user.displayName,
            datePosted: serverTimestamp(),
            isReserved: false,
            status: 'Disponible',
        };
        
        await addDoc(materialsCollection, newMaterialData);

        toast({
            title: '¡Artículo publicado!',
            description: 'El artículo ahora está visible para la comunidad.',
        });
        reset();

    } catch (error: any) {
        console.error("Error al publicar el artículo:", error);
        
        const permissionError = new FirestorePermissionError({
          path: 'materials',
          operation: 'create',
          requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
        
        toast({
            title: 'Error al publicar',
            description: 'Hubo un problema al crear el artículo. Revisa los permisos de la base de datos y la consola para más detalles.',
            variant: 'destructive',
        });
    } finally {
        setIsSubmitting(false);
    }
  };


  if (isUserLoading || !user || user.email !== 'jhelenandreat@gmail.com') {
    return <div className="container text-center py-20">Cargando panel de administración...</div>;
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
      <Card className="w-full max-w-2xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="text-3xl font-headline">Panel de Administración</CardTitle>
            <CardDescription>
              Publica un nuevo artículo para donar. Solo los administradores pueden usar esta función.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="title">Título del Artículo</Label>
                <Input id="title" placeholder="Ej: Mochila escolar azul" {...register('title')} disabled={isSubmitting} />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describe el artículo, su estado, y cualquier detalle importante."
                  {...register('description')}
                  disabled={isSubmitting}
                />
                 {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ropa">Ropa</SelectItem>
                          <SelectItem value="Útiles">Útiles</SelectItem>
                          <SelectItem value="Tecnología">Tecnología</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="condition">Condición</Label>
                  <Controller
                    name="condition"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                        <SelectTrigger id="condition">
                          <SelectValue placeholder="Selecciona la condición" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Nuevo">Nuevo</SelectItem>
                          <SelectItem value="Como nuevo">Como nuevo</SelectItem>
                          <SelectItem value="Usado">Usado</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.condition && <p className="text-sm text-destructive">{errors.condition.message}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="grade-level">Nivel Escolar</Label>
                  <Controller
                    name="gradeLevel"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                        <SelectTrigger id="grade-level">
                          <SelectValue placeholder="Selecciona el nivel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Preescolar">Preescolar</SelectItem>
                          <SelectItem value="Primaria">Primaria</SelectItem>
                          <SelectItem value="Secundaria">Secundaria</SelectItem>
                          <SelectItem value="Todos">Todos</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.gradeLevel && <p className="text-sm text-destructive">{errors.gradeLevel.message}</p>}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="imageUrl">URL de la Foto del Artículo</Label>
                <Input id="imageUrl" type="url" {...register('imageUrl')} disabled={isSubmitting} placeholder="https://ejemplo.com/imagen.jpg" />
                <p className="text-xs text-muted-foreground">Pega la URL de una foto clara del artículo.</p>
                {errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl.message as string}</p>}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button size="lg" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Publicando...' : 'Publicar Artículo'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
