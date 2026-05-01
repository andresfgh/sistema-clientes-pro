import { NextResponse } from 'next/server';
import { ClienteService } from '@/core/services/cliente.service';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        const { csv, filename } = await ClienteService.exportToCSV(id || undefined);

        return new NextResponse(csv, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        });

    } catch (error) {
        console.error('[CLIENTES_EXPORT_ERROR]', error);
        return NextResponse.json({ error: 'Fallo al generar el reporte de clientes' }, { status: 500 });
    }
}