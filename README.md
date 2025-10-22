<!-- cargue forzado -->
# Manos Unidas Digital - Plataforma de Donación de Útiles Escolares

## Misión del Proyecto

**Manos Unidas Digital** es una aplicación web diseñada para digitalizar y facilitar el proceso de donación e intercambio de materiales escolares, uniformes y otros útiles dentro de la comunidad de la Institución Educativa José de la Vega y el Centro de Desarrollo Infantil (CDI) Amoroso.

El objetivo principal es crear un puente directo y eficiente entre las personas que desean donar artículos en buen estado y las familias que los necesitan, fomentando así la reutilización, la solidaridad y el apoyo mutuo.

## Funcionalidades Principales

La aplicación está dividida en dos roles principales: **Usuario Visitante** (cualquier persona que accede al sitio) y **Administrador** (personal autorizado de la institución).

### Para Usuarios Visitantes

- **Catálogo de Artículos**:
  - Visualización de todos los artículos disponibles para donación.
  - Búsqueda y filtrado por palabra clave, categoría, condición y estado (Disponible/Asignado).
- **Vista de Detalle**:
  - Al hacer clic en un artículo, se accede a una página con una descripción completa, fotos, categoría, condición y nivel escolar.
- **Proceso de Solicitud Simplificado**:
  - Los usuarios pueden solicitar un artículo llenando un formulario directamente en la página del artículo.
  - Se solicita información básica de contacto (nombre, dirección, teléfono) y una breve justificación de la necesidad.
  - Incluye un captcha simple (suma matemática) para prevenir spam.
- **Notificación por Correo**:
  - Una vez enviado el formulario, el sistema envía automáticamente un correo electrónico a los administradores de la plataforma con todos los detalles de la solicitud, permitiéndoles gestionar la entrega directamente con el solicitante.
- **Carrusel de "Nuestra Labor en Acción"**:
  - Una sección en la página de inicio que muestra los artículos que ya han sido asignados, visibilizando el impacto positivo de las donaciones.

### Para Administradores

- **Inicio de Sesión Seguro**:
  - Los administradores acceden a través de un inicio de sesión exclusivo con sus cuentas de Google pre-autorizadas. Los usuarios no autorizados no pueden acceder al panel.
- **Panel de Administración (`/profile`)**:
  - **Vista General**: Muestra el perfil del administrador y un resumen de la cantidad total de artículos en la plataforma.
  - **Pestaña "Gestionar Artículos"**:
    - Visualización de **todos** los artículos publicados (disponibles y asignados).
    - **Edición**: Permite modificar la información de cualquier artículo (título, descripción, categoría, etc.).
    - **Eliminación**: Permite borrar permanentemente una publicación.
    - **Gestión de Estado**: Cada artículo tiene un interruptor para cambiar su estado entre **"Disponible"** y **"Asignado"**. Esto permite al administrador marcar un artículo como entregado después de coordinar con el solicitante.
  - **Pestaña "Publicar Nuevo"**:
    - Un formulario completo para que el administrador pueda añadir nuevos artículos al catálogo.
    - Campos para título, descripción, categoría, condición, nivel escolar y URL de la imagen.

## Flujo de Trabajo Típico

1.  **Donación**: Un administrador recibe una donación física. Ingresa al panel de administración, va a "Publicar Nuevo", completa los detalles del artículo y lo publica. El artículo aparece inmediatamente en el catálogo como "Disponible".
2.  **Solicitud**: Un padre de familia navega por el catálogo, encuentra un uniforme que necesita y hace clic en "Ver Detalles".
3.  **Formulario**: Dentro de la página del artículo, hace clic en "Solicitar Artículo", llena sus datos de contacto y explica por qué lo necesita.
4.  **Notificación**: Los administradores reciben un correo con la información de la solicitud.
5.  **Coordinación**: El administrador contacta al solicitante por teléfono para coordinar la entrega del uniforme en la institución.
6.  **Actualización de Estado**: Una vez entregado el uniforme, el administrador vuelve a su panel, busca el artículo y usa el interruptor para cambiar su estado a "Asignado". El artículo ahora aparecerá en el carrusel "Nuestra Labor en Acción".

## Tecnología Utilizada

- **Framework**: Next.js (con App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS con ShadCN/UI para los componentes.
- **Base de Datos**: Firestore (para almacenar los artículos y la información de los usuarios administradores).
- **Autenticación**: Firebase Authentication (para el inicio de sesión de administradores con Google).
- **Backend y Notificaciones**: Genkit (para orquestar flujos de backend) y Resend (para el envío de correos electrónicos transaccionales).
- **Hosting**: Desplegado en Vercel (Frontend) y Firebase App Hosting.
