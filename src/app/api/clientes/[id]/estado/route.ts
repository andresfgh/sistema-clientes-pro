import { NextResponse } from 'next/server';
import { ClienteService } from '@/core/services/cliente.service';

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        
        if (typeof body.estado !== 'boolean') {
            return NextResponse.json({ error: 'El campo estado debe ser booleano' }, { status: 400 });
        }

        const clienteActualizado = await ClienteService.toggleEstado(id, body.estado);

        return NextResponse.json(clienteActualizado, { status: 200 });
    } catch (error: any) {
        console.error('[CLIENTE_PATCH_ESTADO_ERROR]', error);
        if (error.message === 'NOT_FOUND') {
            return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Fallo al actualizar el estado del cliente' }, { status: 500 });
    }
}
