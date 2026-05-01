import { NextResponse } from 'next/server';
import { ClienteService } from '@/core/services/cliente.service';

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const cliente = await ClienteService.findById(id);

        return NextResponse.json(cliente, { status: 200 });
    } catch (error: any) {
        console.error('[CLIENTE_GET_BY_ID_ERROR]', error);
        if (error.message === 'NOT_FOUND') {
            return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Fallo al recuperar el cliente' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        const clienteActualizado = await ClienteService.update(id, body);

        return NextResponse.json(clienteActualizado, { status: 200 });
    } catch (error: any) {
        console.error('[CLIENTE_PUT_ERROR]', error);
        if (error.message === 'NOT_FOUND') {
            return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Fallo al actualizar el cliente' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;

        await ClienteService.softDelete(id);

        return new NextResponse(null, { status: 204 });
    } catch (error: any) {
        console.error('[CLIENTE_DELETE_ERROR]', error);
        if (error.message === 'NOT_FOUND') {
            return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Fallo al eliminar el cliente' }, { status: 500 });
    }
}