import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row justify-center items-center">
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} Manos Unidas Digital. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
