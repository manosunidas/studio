-- Crear tipos ENUM para estandarizar los valores de ciertas columnas.
-- Esto mejora la integridad de los datos y el rendimiento.

CREATE TYPE material_category AS ENUM (
  'Ropa',
  'Útiles',
  'Tecnología',
  'Libros',
  'Uniformes',
  'Calzado'
);

CREATE TYPE material_condition AS ENUM (
  'Nuevo',
  'Como nuevo',
  'Usado'
);

CREATE TYPE material_grade_level AS ENUM (
  'Preescolar',
  'Primaria',
  'Secundaria',
  'Todos'
);

CREATE TYPE material_status AS ENUM (
  'Disponible',
  'Asignado'
);

CREATE TYPE solicitud_status AS ENUM (
  'Pendiente',
  'Rechazada'
);


-- Tabla para almacenar la información de los usuarios (administradores).
-- El ID de Firebase Auth se usará como clave primaria.
CREATE TABLE users (
  id TEXT PRIMARY KEY, -- UID de Firebase Auth
  google_id TEXT UNIQUE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  profile_picture_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla para almacenar los materiales escolares disponibles para donación.
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  posted_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category material_category NOT NULL,
  grade_level material_grade_level NOT NULL,
  condition material_condition NOT NULL,
  image_url TEXT,
  image_hint TEXT,
  status material_status NOT NULL DEFAULT 'Disponible',
  solicitudes_count INT NOT NULL DEFAULT 0,
  date_posted TIMESTAMPTZ DEFAULT NOW(),
  
  -- Se deja NULLABLE porque al inicio no está asignado a ninguna solicitud.
  -- Se llenará cuando un administrador asigne el material.
  asignado_a_solicitud_id UUID
);

-- Tabla para almacenar las solicitudes de los materiales.
CREATE TABLE solicitudes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  
  -- Para usuarios anónimos o no registrados, se puede usar un ID temporal o de sesión.
  -- Para usuarios registrados, se usaría su ID de la tabla 'users'.
  solicitante_id TEXT NOT NULL, 
  
  fecha_solicitud TIMESTAMPTZ DEFAULT NOW(),
  nombre_completo TEXT NOT NULL,
  direccion TEXT NOT NULL,
  telefono TEXT NOT NULL,
  status solicitud_status NOT NULL DEFAULT 'Pendiente'
);

-- Añadir la clave foránea que faltaba en la tabla 'materials'.
-- Esto crea una referencia circular, por lo que se define después de crear ambas tablas.
ALTER TABLE materials
ADD CONSTRAINT fk_asignado_a_solicitud
FOREIGN KEY (asignado_a_solicitud_id) 
REFERENCES solicitudes(id)
ON DELETE SET NULL; -- Si se elimina la solicitud, el material vuelve a estar disponible.

-- Habilitar Row Level Security (RLS) para todas las tablas.
-- Esta es una buena práctica de seguridad en Supabase.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes ENABLE ROW LEVEL SECURITY;

-- Ejemplo de políticas de seguridad (puedes ajustarlas según tus necesidades):

-- Política para la tabla 'users':
-- Permite a los usuarios leer su propia información.
CREATE POLICY "Allow users to read their own data"
ON users
FOR SELECT
USING (auth.uid() = id);

-- Política para la tabla 'materials':
-- Permite a cualquier persona leer los materiales.
CREATE POLICY "Allow anyone to read materials"
ON materials
FOR SELECT
USING (true);

-- Permite a los usuarios autenticados (administradores) crear materiales.
CREATE POLICY "Allow authenticated users to create materials"
ON materials
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Permite al usuario que posteó el material actualizarlo o eliminarlo.
CREATE POLICY "Allow owner to update or delete their materials"
ON materials
FOR UPDATE, DELETE
USING (auth.uid() = posted_by);

-- Política para la tabla 'solicitudes':
-- Permite a cualquier usuario autenticado (incluidos anónimos) crear una solicitud.
CREATE POLICY "Allow authenticated users to create solicitudes"
ON solicitudes
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Permite al dueño del material leer las solicitudes de sus materiales.
CREATE POLICY "Allow material owner to read solicitudes"
ON solicitudes
FOR SELECT
USING (
  auth.uid() IN (
    SELECT posted_by FROM materials WHERE id = material_id
  )
);
