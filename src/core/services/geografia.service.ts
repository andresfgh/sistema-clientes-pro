import { prisma } from '@/lib/prisma';

export class GeografiaService {
    static async getDepartamentos() {
        return await prisma.departamento.findMany({
            orderBy: { nombre: 'asc' }
        });
    }

    static async getMunicipios(departamentoId: string) {
        return await prisma.municipio.findMany({
            where: { departamentoId },
            orderBy: { nombre: 'asc' }
        });
    }

    static async getDistritos(municipioId: string) {
        return await prisma.distrito.findMany({
            where: { municipioId },
            orderBy: { nombre: 'asc' }
        });
    }
}
