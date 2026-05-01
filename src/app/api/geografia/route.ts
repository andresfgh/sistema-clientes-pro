import { NextResponse } from 'next/server';
import { GeografiaService } from '@/core/services/geografia.service';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const parentId = searchParams.get('parentId');

        if (type === 'departamentos') {
            const data = await GeografiaService.getDepartamentos();
            return NextResponse.json(data);
        }

        if (type === 'municipios' && parentId) {
            const data = await GeografiaService.getMunicipios(parentId);
            return NextResponse.json(data);
        }

        if (type === 'distritos' && parentId) {
            const data = await GeografiaService.getDistritos(parentId);
            return NextResponse.json(data);
        }

        return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });

    } catch (error) {
        console.error('[GEOGRAFIA_GET_ERROR]', error);
        return NextResponse.json({ error: 'Fallo al recuperar datos geográficos' }, { status: 500 });
    }
}
