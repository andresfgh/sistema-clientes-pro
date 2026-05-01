# Sistema Administrativo de Clientes

Este repositorio contiene el código fuente del Sistema Integrado de Gestión de Clientes, una plataforma de *Backoffice* desarrollada bajo los principios de **Clean Architecture**. La aplicación ha sido diseñada con un enfoque estrictamente funcional, priorizando la densidad de datos, la velocidad operativa y la trazabilidad, características esenciales para entornos de gestión corporativa tipo *AdminLTE*.

---

## 🚀 Características Principales

*   **Arquitectura Transaccional Robusta:** Implementación de un patrón de Repositorio/Servicio. Las operaciones maestras y de detalle (creación y edición de Clientes, Direcciones y Documentos) son completamente atómicas bajo transacciones de base de datos.
*   **Interfaz de Usuario Ultra-Compacta:** Interfaz diseñada sin elementos distractivos, maximizando el espacio para los datos. Estilo corporativo "plano" sin sombras, usando Tailwind CSS v4.
*   **Auditoría y Trazabilidad (Timeline):** Todo cambio (`CREATE`, `UPDATE`, `DELETE`, `REACTIVATE`) queda registrado de manera inmutable con estampa de tiempo y el identificador del usuario que lo realizó.
*   **Gestión de Estado (Soft Delete):** Eliminación lógica de los registros en la base de datos para preservar la integridad referencial en todo momento.
*   **Exportación Dinámica de CSV:** 
    *   *Masiva:* Descarga de todo el listado de clientes activos con nombre autogenerado (`reporte_clientes_general_YYYY-MM-DD.csv`).
    *   *Individual:* Descarga específica sanitizada (ej. `cliente_nombres_apellidos_id.csv`). Las múltiples direcciones y documentos se concatenan automáticamente en el CSV.

---

## 🛠️ Stack Tecnológico

El proyecto está construido utilizando tecnologías modernas pero estabilizadas para garantizar mantenibilidad a largo plazo:

*   **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4 (Nativo usando `@import 'tailwindcss'`).
*   **Backend API:** Route Handlers de Next.js, conectando la vista con los Controladores/Servicios.
*   **Capa de Datos:** Prisma ORM v5, PostgreSQL 15.
*   **Infraestructura:** Docker y Docker Compose para un ambiente agnóstico y de rápida integración.

---

## 📦 Instrucciones de Despliegue (Docker)

El sistema ha sido "dockerizado" utilizando imágenes ligeras de Alpine Linux (`node:20-alpine`) a través de un *Multi-stage build* para minimizar el peso del contenedor de producción.

### 1. Variables de Entorno
Asegúrese de contar con un archivo `.env` en la raíz del proyecto. Puede usar el archivo de ejemplo proporcionado:
```bash
cp .env.example .env
```

### 2. Ejecutar Contenedores
Para compilar la aplicación y levantar la base de datos de PostgreSQL, ejecute en su terminal:
```bash
docker-compose up -d --build
```
*Este comando instalará las dependencias, ejecutará automáticamente las migraciones de Prisma y levantará la plataforma de forma local.*

### 3. Acceso a la Plataforma
El portal administrativo estará disponible en su navegador en:
**[http://localhost:3000](http://localhost:3000)**

*(Credenciales provistas por la administración para pruebas de entorno local).*

---

## 🏗️ Estructura del Código

El proyecto está organizado aislando la lógica de negocio de la capa de presentación:

```text
/src
├── app/               # Enrutamiento UI (Next.js App Router) y Endpoints REST (/api)
├── components/        # Componentes de presentación (ClientForm, UI compartida)
├── core/
│   ├── interfaces/    # Definiciones estables (DTOs, Types)
│   └── services/      # Casos de uso y lógica transaccional (ClienteService, AuditService)
└── lib/               # Utilidades de infraestructura (Instancia de Base de Datos Prisma)
```

---

## 📝 Estándares de Desarrollo Adoptados

*   **Tipado Riguroso:** Implementación estricta de TypeScript; se ha erradicado el uso de variables tipo `any`.
*   **Limpieza de CSS:** Uso exclusivo del motor `@tailwindcss/postcss` en su versión 4, consolidando variables globales nativas y removiendo archivos de configuración heredados de la versión 3.
*   **Seguridad:** Las peticiones desde el cliente hacia la API están securizadas y validadas. La exportación gestiona correctamente las cabeceras HTTP de respuesta y sanitiza la salida de los archivos.
