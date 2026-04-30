import { PrismaClient } from '@prisma/client';

// Se utiliza globalThis para mantener la instancia de Prisma persistente durante el desarrollo local.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}