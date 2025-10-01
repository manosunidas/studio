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
  CardFooter,
  CardHeader,
  CardTitle,
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
import { useItems } from '@/hooks/use-items';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

const formSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  description: z.string().min(1, 'La descripción es obligatoria'),
  category: z.enum(['Útiles', 'Libros', 'Uniformes'], { required_error: 'Selecciona una categoría' }),
  condition: z.enum(['Nuevo', 'Como nuevo', 'Usado'], { required_error: 'Selecciona la condición' }),
  gradeLevel: z.enum(['Primaria', 'Secundaria', 'Bachillerato', 'Todos'], { required_error: 'Selecciona el nivel escolar' }),
  picture: z.any().refine(files => files?.length > 0, 'La foto es obligatoria.'),
});

type FormData = z.infer<typeof formSchema>;

export default function PostItemPage() {
  const router = useRouter();
  const { addItem } = useItems();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

   useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: 'Acceso denegado',
        description: 'Debes iniciar sesión para publicar un artículo.',
        variant: 'destructive',
      });
      router.push('/login');
    }
  }, [user, authLoading, router, toast]);

  const onSubmit = (data: FormData) => {
    if (!user) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      const newItem = {
        id: Date.now().toString(),
        ...data,
        imageUrl: reader.result as string,
        imageHint: 'custom item',
        postedBy: user.email,
        isReserved: false,
      };
      addItem(newItem);
      toast({
        title: '¡Artículo publicado!',
        description: 'Tu artículo ahora está visible para la comunidad.',
      });
      router.push('/');
    };
    reader.readAsDataURL(data.picture[0]);
  };

  if(authLoading || !user) {
    return <div className="container text-center py-20">Cargando...</div>;
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
      <Card className="w-full max-w-2xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="text-3xl font-headline">Publicar un Artículo</CardTitle>
            <CardDescription>
              Completa el formulario para donar o intercambiar un artículo. Tu generosidad hace la diferencia.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="title">Título del Artículo</Label>
                <Input id="title" placeholder="Ej: Mochila escolar azul" {...register('title')} />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describe el artículo, su estado, y cualquier detalle importante."
                  {...register('description')}
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Útiles">Útiles</SelectItem>
                          <SelectItem value="Libros">Libros</SelectItem>
                          <SelectItem value="Uniformes">Uniformes</SelectItem>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="grade-level">
                          <SelectValue placeholder="Selecciona el nivel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Primaria">Primaria</SelectItem>
                          <SelectItem value="Secundaria">Secundaria</SelectItem>
                          <SelectItem value="Bachillerato">Bachillerato</SelectItem>
                          <SelectItem value="Todos">Todos</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.gradeLevel && <p className="text-sm text-destructive">{errors.gradeLevel.message}</p>}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="picture">Foto del Artículo</Label>
                <Input id="picture" type="file" {...register('picture')} />
                <p className="text-xs text-muted-foreground">Sube una foto clara del artículo.</p>
                {errors.picture && <p className="text-sm text-destructive">{errors.picture.message as string}</p>}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button size="lg" type="submit">Publicar Artículo</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
