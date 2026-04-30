import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Contrato de datos estricto para asegurar la consistencia del registro de auditoria
interface AuditPayload {
    clienteId: string;
    accion: 'CREATE' | 'UPDATE' | 'DELETE';
    detalles: Prisma.InputJsonValue;
    usuarioId: string;
}

// Insercion asincrona del log de auditoria. 
export async function registrarAuditoria({ clienteId, accion, detalles, usuarioId }: AuditPayload) {
    try {
    await prisma.auditoria.create({
        data: {
        clienteId,
        accion,
        detalles,
        usuarioId,
        }
    });
    } catch (error) {
    // Falla silenciosa controlada para no interrumpir el flujo principal de negocio en caso de error de logueo
    console.error('[AUDIT_SERVICE_ERROR]', error);
    }
}