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
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';


const formSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  description: z.string().min(1, 'La descripción es obligatoria'),
  category: z.enum(['Ropa', 'Útiles', 'Tecnología'], { required_error: 'Selecciona una categoría' }),
  condition: z.enum(['Nuevo', 'Como nuevo', 'Usado'], { required_error: 'Selecciona la condición' }),
  gradeLevel: z.enum(['Primaria', 'Secundaria', 'Bachillerato', 'Todos'], { required_error: 'Selecciona el nivel escolar' }),
  picture: z.any().refine(files => files?.length > 0, 'La foto es obligatoria.'),
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
      const file = data.picture[0];
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const fileContent = e.target?.result as string;
        
        try {
            // 1. Upload image to Firebase Storage
            const storage = getStorage();
            const storageRef = ref(storage, `materials/${Date.now()}_${file.name}`);
            const snapshot = await uploadString(storageRef, fileContent, 'data_url');
            const imageUrl = await getDownloadURL(snapshot.ref);

            // 2. Add item to Firestore
            const materialsCollection = collection(firestore, 'materials');
            await addDoc(materialsCollection, {
              title: data.title,
              description: data.description,
              category: data.category,
              condition: data.condition,
              gradeLevel: data.gradeLevel,
              imageUrl: imageUrl,
              imageHint: 'school supplies', // You can create a more dynamic hint later
              postedBy: user.email,
              postedByName: user.displayName,
              datePosted: serverTimestamp(),
              isReserved: false,
              status: 'Disponible',
            });

            toast({
              title: '¡Artículo publicado!',
              description: 'El artículo ahora está visible para la comunidad.',
            });
            reset(); // Reset form fields
        } catch (error) {
            console.error("Error creating item:", error);
            toast({
                title: 'Error al publicar',
                description: 'Hubo un problema al crear el artículo. Inténtalo de nuevo.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
      };

      reader.onerror = (error) => {
          console.error("FileReader error:", error);
           toast({
            title: 'Error al leer el archivo',
            description: 'No se pudo cargar la imagen. Inténtalo de nuevo.',
            variant: 'destructive',
          });
          setIsSubmitting(false);
      }

      reader.readAsDataURL(file);

    } catch (error) {
      console.error("Error preparing file:", error);
      toast({
        title: 'Error de Archivo',
        description: 'Hubo un problema al preparar la imagen para subir. Inténtalo de nuevo.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  if (isUserLoading || (user && user.email !== 'jhelenandreat@gmail.com')) {
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
                <Input id="picture" type="file" {...register('picture')} disabled={isSubmitting} accept="image/*" />
                <p className="text-xs text-muted-foreground">Sube una foto clara del artículo.</p>
                {errors.picture && <p className="text-sm text-destructive">{errors.picture.message as string}</p>}
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
