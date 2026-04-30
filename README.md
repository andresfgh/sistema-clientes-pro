# 🏢 Sistema de Administración de Clientes

Plataforma empresarial orientada a la gestión de clientes bajo una arquitectura maestro-detalle. Diseñada con un enfoque estricto en alto rendimiento, seguridad y una experiencia de despliegue automatizada.

---

## 🚀 Puesta en Marcha Rápida (Recomendado)

El entorno está completamente dockerizado para garantizar su ejecución aislada en cualquier sistema. Solo requieres tener Git, Docker y Docker Compose instalados.

### Flujo de Instalación

1. Clonar el Repositorio

git clone -b main https://github.com/andresfgh/sistema-clientes-pro.git
cd sistema-clientes-pro


2. Levantar Infraestructura (Construcción Multi-Stage optimizada)

docker-compose up -d --build

3. Sincronización de Base de Datos (Migraciones de Prisma)

docker exec -it app_clientes npx prisma migrate deploy

4. Población de Datos Maestros (Seed de Administrador)

docker exec -it app_clientes npx prisma db seed


🌐 Acceso al sistema: [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Configuración Obligatoria (.env)
Es estrictamente necesario crear un archivo llamado .env en la raíz del proyecto antes de iniciar los contenedores. Sin estas variables, el motor de Prisma y el sistema de autenticación no podrán inicializarse.

Crea el archivo .env en la raíz del proyecto con las siguientes variables:

dotenv# URL de conexión hacia el contenedor PostgreSQL local
    DATABASE_URL="postgresql://root:rootpassword@localhost:5432/db_clientes?schema=public"

Clave criptográfica para firma de tokens JWT (HS256)
    JWT_SECRET="tu_clave_secreta_generada_en_base64"

Nota sobre DATABASE_URL: El host localhost aplica cuando PostgreSQL corre como contenedor con el puerto expuesto al host. Si desplegaras ambos servicios dentro de la misma red Docker, el host debe ser el nombre del servicio (postgres).

Nota sobre JWT_SECRET: El algoritmo HS256 requiere una clave simétrica en Base64 de al menos 32 bytes. 

---

## 🔐 Credenciales de Acceso (Entorno de Pruebas)

| Campo         | Valor           |
| Usuario       | admin           |
| Contraseña    |  adminpassword  |

---

## 🧠 Arquitectura y Decisiones Técnicas

Como solución de grado empresarial, se implementaron los siguientes pilares técnicos:

- Clean Architecture: Separación clara entre la capa de Dominio (Interfaces y Servicios en  src/core ), la capa de Infraestructura (Prisma y DB en  src/lib ) y la capa de Presentación/API ( src/app ).
- Despliegue Multi-Stage: El  Dockerfile  utiliza una etapa de *builder* para compilar la aplicación y una etapa de *runner* basada en Alpine Linux para reducir el tamaño de la imagen final y mejorar la seguridad.
- Seguridad mediante HttpOnly Cookies: Implementación de JWT con la librería  jose . Los tokens se gestionan exclusivamente vía cookies con flags  HttpOnly  y  Secure , mitigando ataques de robo de sesión por XSS.
- Integridad con Transacciones Atómicas: Las operaciones maestro-detalle (Cliente + N Direcciones + N Documentos) se ejecutan mediante  $transaction  de Prisma, asegurando consistencia total de datos.
- Auditoría de Operaciones: El sistema incluye un servicio de auditoría ( audit.service.ts ) que registra de forma inmutable las acciones críticas (Create, Update, Delete) para trazabilidad.

---

## 📂 Estructura del Proyecto

text
src/
├── app/                  # Route Handlers (API) y Server Components (Vistas)
├── components/           # UI Components (Atomic Design orientado a Tailwind)
├── core/                 # Núcleo del Sistema (Independiente del Framework)
│   ├── interfaces/       # Definiciones de tipos y DTOs
│   └── services/         # Casos de uso y lógica de negocio
├── lib/                  # Adaptadores (Prisma Client, Configuraciones)
└── middleware.ts         # Protección de rutas mediante interceptor JWT


---

## 🔌 Referencia de la API REST

| Método | Endpoint                 | Descripción                           | Requisito Auth    |
| :---   | :---                     | :---                                  | :---              |
|  POST  |  /api/auth/login         | Autenticación y set-cookie JWT        | Público           |
|  GET   |  /api/clientes           | Lista paginada de clientes            | JWT               |
|  POST  |  /api/clientes           | Registro transaccional de cliente     | JWT               |
|  GET   |  /api/clientes/[id]      | Detalle extendido (Maestro-Detalle)   | JWT               |
|  GET   |  /api/clientes/export    | Generación de reporte CSV             | JWT               |

---

## 💻 Stack Tecnológico

| Capa          | Tecnología                                |
| :---          | :---                                      |
| Framework     | Next.js 16 (App Router) & React           |
| Estilos       | Tailwind CSS (Arquitectura Utility-First) |
| ORM           | Prisma v5 (Type-safe Queries)             |
| Base de Datos | PostgreSQL 15                             |
| Contenedores  | Docker & Docker Compose                   |

---

## 🛠️ Desarrollo Local (Modo Híbrido)

Si deseas iterar rápidamente en la UI sin reconstruir contenedores:

# 1. Instalar dependencias
npm install

# 2. Levantar solo la BD
docker-compose up -d postgres

# 4. Preparar la base de datos
npx prisma migrate dev && npx prisma db seed

# 5. Iniciar servidor de desarrollo
npm run dev

---

