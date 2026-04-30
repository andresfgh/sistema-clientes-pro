import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { registrarAuditoria } from '@/core/services/audit.service';

// Endpoint para el registro inicial de clientes
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { nombres, apellidos, fechaNacimiento, direcciones, documentos } = body;

        // Prisma ejecuta un "Nested Write" transaccional. 
        // Si falla la insercion de un documento, la creacion del cliente hace rollback automaticamente.
        const nuevoCliente = await prisma.cliente.create({
            data: {
                nombres,
                apellidos,
                fechaNacimiento: new Date(fechaNacimiento),
                direcciones: {
                    create: direcciones
                },
                documentos: {
                    create: documentos
                }
            },
            // Se solicita el retorno de las entidades dependientes para tener el payload completo
            include: {
                direcciones: true,
                documentos: true
            }
        });

        // Disparo del evento de auditoria. 
        await registrarAuditoria({
            clienteId: nuevoCliente.id,
            accion: 'CREATE',
            detalles: nuevoCliente,
            usuarioId: 'SYSTEM_PROVISIONAL' 
        });

        // Retorno de codigo de estado 201 (Created) siguiendo el estandar REST
        return NextResponse.json(nuevoCliente, { status: 201 });

    } catch (error) {
        console.error('[CLIENTES_POST_ERROR]', error);
        return NextResponse.json({ error: 'Fallo al procesar la peticion de registro' }, { status: 500 });
    }
}

// Endpoint para listar el directorio de clientes
export async function GET() {
    try {
        // Recuperacion de la coleccion completa ordenados por fecha de creacion descendente
        const clientes = await prisma.cliente.findMany({
            include: {
                direcciones: true,
                documentos: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(clientes, { status: 200 });
    } catch (error) {
        console.error('[CLIENTES_GET_ERROR]', error);
        return NextResponse.json({ error: 'Fallo al recuperar la lista de clientes' }, { status: 500 });
    }
}