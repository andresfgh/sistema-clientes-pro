import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // Definicion de credenciales base para el entorno de evaluacion
    const username = 'admin';
    const rawPassword = 'adminpassword'; 
    // Generacion del hash con un factor de costo estandar (10 rondas)
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    // Operacion idempotente: Inserta el registro solo si no existe
    const usuario = await prisma.usuario.upsert({
        where: { username },
        update: {}, // Si existe, no realiza ninguna accion
        create: {
            username,
            passwordHash,
        },
    });

    console.log(`[SEED_SUCCESS] Usuario maestro inicializado. Username: ${usuario.username}`);
}

// Ejecucion aislada y gestion estricta de la conexion a base de datos
main()
    .catch((e) => {
        console.error('[SEED_ERROR]', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });