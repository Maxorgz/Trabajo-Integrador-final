## App del Trabajo Integrador final

# Guia de uso

### Levantar el Proyecto Fotaza!
 
- Instalar todas las dependencias con `npm install`
- Iniciar `npm run dev` para entrar en el modo v

# Fotaza - Trabajo Practico Integrador (Web 2)

**Fotaza** es una plataforma web interactiva de publicación, valoración y gestión de fotografias, desarrollada como Trabajo Práctico Integrador para la **Tecnicatura Universitaria en Desarrollo de Software**. 

La aplicación está diseñada bajo una arquitectura Renderizada del Lado del Servidor (SSR) y permite a los usuarios interactuar mediante un sistema de seguidores, calificaciones, comentarios y filtros dinámicos, ofreciendo una experiencia fluida tanto para usuarios registrados como para invitados.

## Funciones Principales

* **Sistema de Usuarios y Perfiles:** Registro e inicio de sesión. Perfiles públicos con galería personal y contador de Seguidores/Seguidos.
* **Interacción Social:** Capacidad de seguir/dejar de seguir a otros fotógrafos, comentar publicaciones, dar "Me gusta" y calificar fotos con un sistema de 1 a 5 estrellas.
* **Galeria Dinamica (Estilo Masonry):** Visualización de imágenes optimizada con Tailwind CSS, adaptable a cualquier dispositivo.

* **Buscador y Filtros Avanzados:** Búsqueda dual (por publicaciones o por usuarios) y filtrado combinado mediante Etiquetas (Categorías) y Orden cronológico (Más recientes/Antiguas).

* **Modo Invitado:** Los usuarios no registrados pueden explorar la plataforma y ver fotos libres de derechos de autor (licencia `sin_copyright`), con notificaciones interactivas para invitarlos a unirse.

## Utilidades

* **Backend:** Node.js, Express.js
* **Base de Datos:** PostgreSQL
* **ORM:** Sequelize
* **Motor de Plantillas:** Pug
* **Estilos y UI:** Tailwind CSS (Diseño nativo y responsive sin frameworks externos pesados).
* **Gestión de Sesiones:** express-session

## Instalación y Ejecución Local

Sigue estos pasos para correr el proyecto en tu entorno local:

**1. Clonar el repositorio**
```bash
git clone [TU_LINK_DE_GITHUB]
cd FotazaApp
2. Instalar dependencias

Bash
npm install
3. Configuración de Variables de Entorno (.env)
Crea un archivo .env en la raíz del proyecto con la siguiente estructura (ajusta los valores según tu entorno local):

Fragmento de código
PORT=3000
DB_HOST=localhost
DB_USER=postgres
DB_PASS=tu_contraseña_aqui
DB_NAME=FotazaApp
DB_PORT=5432
SESSION_SECRET=claveSecretaSession_Fotaza

4. Preparar la Base de Datos
Asegúrate de tener tu motor de PostgreSQL corriendo y crea una base de datos vacía llamada FotazaApp.
Luego, ejecuta el script de inicialización para crear las tablas y cargar datos de prueba:

Bash
npm run db:init
5. Ejecutar la aplicación

Bash
npm start
La app se visualiza en http://localhost:3000

Usuarios de Prueba (Seed)
Al ejecutar el comando db:init, se generan las sig. cuentas con la contraseña generica 123456 para facilitar la evaluación del proyecto:

Administrador: admin@test.com (Rol: Validador)

Usuarios ejemplo: * maxo@test.com

flor@test.com

gustavo@test.com

lucas@test.com


Problemas tecnicos, se tubieron muchos diversos problemas, pero el que mas destaco fue el de enlazar las imagens de base64 a BD.

Filtros Combinados en Sequelize: Se implementó una lógica de subconsultas condicionales (subQuery: false e INNER JOINS estrictos) para permitir a los usuarios cruzar filtros de Etiquetas con ordenamientos de fechas sin que el ORM omitiera resultados en la base de datos.

Tailwind: Se modelo el proyecto, basado en tailwind y CSS

Almacenamiento Base64: Se almacenan en base64 segun lo visto en clases