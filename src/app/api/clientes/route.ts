import { NextResponse } from 'next/server';
import { ClienteService } from '@/core/services/cliente.service';

// Endpoint para el registro inicial de clientes
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const nuevoCliente = await ClienteService.create(body);

        // Retorno de codigo de estado 201 (Created) siguiendo el estandar REST
        return NextResponse.json(nuevoCliente, { status: 201 });

    } catch (error) {
        console.error('[CLIENTES_POST_ERROR]', error);
        return NextResponse.json({ error: 'Fallo al procesar la peticion de registro' }, { status: 500 });
    }
}

// Endpoint para listar el directorio de clientes
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const includeInactive = searchParams.get('inactivos') === 'true';

        const clientes = await ClienteService.findAll(includeInactive);
        return NextResponse.json(clientes, { status: 200 });
    } catch (error) {
        console.error('[CLIENTES_GET_ERROR]', error);
        return NextResponse.json({ error: 'Fallo al recuperar la lista de clientes' }, { status: 500 });
    }
}