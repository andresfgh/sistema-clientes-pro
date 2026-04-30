import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { registrarAuditoria } from '@/core/services/audit.service';

// Actualizacion arquitectonica: En Next.js moderno, 'params' es una Promesa.
interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        // Resolvemos la promesa de los parametros antes de desestructurar
        const resolvedParams = await params;
        const { id } = resolvedParams;

        const cliente = await prisma.cliente.findUnique({
            where: { id },
            include: {
                direcciones: true,
                documentos: true
            }
        });

        if (!cliente) {
            return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
        }

        return NextResponse.json(cliente, { status: 200 });
    } catch (error) {
        console.error('[CLIENTE_GET_BY_ID_ERROR]', error);
        return NextResponse.json({ error: 'Fallo al recuperar el cliente' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const resolvedParams = await params;
        const { id } = resolvedParams;
        
        const body = await request.json();
        const { nombres, apellidos, fechaNacimiento, direcciones, documentos } = body;

        const clienteExistente = await prisma.cliente.findUnique({ where: { id } });
        if (!clienteExistente) {
            return NextResponse.json({ error: 'Cliente no encontrado para actualizar' }, { status: 404 });
        }

        const clienteActualizado = await prisma.cliente.update({
            where: { id },
            data: {
                nombres,
                apellidos,
                fechaNacimiento: new Date(fechaNacimiento),
                direcciones: {
                    deleteMany: {},
                    create: direcciones
                },
                documentos: {
                    deleteMany: {},
                    create: documentos
                }
            },
            include: {
                direcciones: true,
                documentos: true
            }
        });

        await registrarAuditoria({
            clienteId: id,
            accion: 'UPDATE',
            detalles: clienteActualizado,
            usuarioId: 'SYSTEM'
        });

        return NextResponse.json(clienteActualizado, { status: 200 });
    } catch (error) {
        console.error('[CLIENTE_PUT_ERROR]', error);
        return NextResponse.json({ error: 'Fallo al actualizar el cliente' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const resolvedParams = await params;
        const { id } = resolvedParams;

        const clientePrevio = await prisma.cliente.findUnique({
            where: { id },
            include: { direcciones: true, documentos: true }
        });

        if (!clientePrevio) {
            return NextResponse.json({ error: 'Cliente no encontrado para eliminar' }, { status: 404 });
        }

        await prisma.cliente.delete({
            where: { id }
        });

        await registrarAuditoria({
            clienteId: id,
            accion: 'DELETE',
            detalles: clientePrevio,
            usuarioId: 'SYSTEM'
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('[CLIENTE_DELETE_ERROR]', error);
        return NextResponse.json({ error: 'Fallo al eliminar el cliente' }, { status: 500 });
    }
}