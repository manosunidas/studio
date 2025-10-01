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

export default function PostItemPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Publicar un Artículo</CardTitle>
          <CardDescription>
            Completa el formulario para donar o intercambiar un artículo. Tu generosidad hace la diferencia.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="title">Título del Artículo</Label>
              <Input id="title" placeholder="Ej: Mochila escolar azul" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Describe el artículo, su estado, y cualquier detalle importante."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Categoría</Label>
                <Select>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utiles">Útiles</SelectItem>
                    <SelectItem value="libros">Libros</SelectItem>
                    <SelectItem value="uniformes">Uniformes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="condition">Condición</Label>
                <Select>
                  <SelectTrigger id="condition">
                    <SelectValue placeholder="Selecciona la condición" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nuevo">Nuevo</SelectItem>
                    <SelectItem value="como-nuevo">Como nuevo</SelectItem>
                    <SelectItem value="usado">Usado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
               <div className="grid gap-2">
                <Label htmlFor="grade-level">Nivel Escolar</Label>
                <Select>
                  <SelectTrigger id="grade-level">
                    <SelectValue placeholder="Selecciona el nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primaria">Primaria</SelectItem>
                    <SelectItem value="secundaria">Secundaria</SelectItem>
                    <SelectItem value="bachillerato">Bachillerato</SelectItem>
                     <SelectItem value="todos">Todos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="picture">Foto del Artículo</Label>
              <Input id="picture" type="file" />
               <p className="text-xs text-muted-foreground">Sube una o más fotos claras del artículo.</p>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button size="lg">Publicar Artículo</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
