import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Endpoint para la generacion y descarga del reporte general de clientes en formato CSV
export async function GET() {
    try {
        const clientes = await prisma.cliente.findMany({
            include: {
                direcciones: true,
                documentos: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Definicion estandar de cabeceras para el archivo CSV
        const cabeceras = [
            'ID',
            'Nombres',
            'Apellidos',
            'Fecha_Nacimiento',
            'Total_Direcciones',
            'Total_Documentos',
            'Fecha_Registro'
        ];

        // Mapeo de la coleccion a formato tabular
        // Se utilizan comillas dobles en campos de texto para evitar rupturas por comas internas
        const filas = clientes.map(cliente => {
            return [
                cliente.id,
                `"${cliente.nombres}"`,
                `"${cliente.apellidos}"`,
                cliente.fechaNacimiento.toISOString().split('T')[0],
                cliente.direcciones.length.toString(),
                cliente.documentos.length.toString(),
                cliente.createdAt.toISOString()
            ].join(',');
        });

        // Construccion del string final con saltos de linea estandar
        const contenidoCsv = [cabeceras.join(','), ...filas].join('\n');

        // Retorno de la respuesta con cabeceras HTTP para forzar la descarga del archivo en el navegador
        return new NextResponse(contenidoCsv, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': 'attachment; filename="reporte_clientes.csv"'
            }
        });

    } catch (error) {
        console.error('[CLIENTES_EXPORT_ERROR]', error);
        return NextResponse.json({ error: 'Fallo al generar el reporte de clientes' }, { status: 500 });
    }
}