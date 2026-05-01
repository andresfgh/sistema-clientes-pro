import { prisma } from '@/lib/prisma';
import { registrarAuditoria } from './audit.service';
import { ClientePayload } from '../interfaces/cliente';

export class ClienteService {
    static async create(payload: ClientePayload, usuarioId: string = 'SYSTEM') {
        const { nombres, apellidos, fechaNacimiento, direcciones, documentos } = payload;

        return await prisma.$transaction(async (tx) => {
            const nuevoCliente = await tx.cliente.create({
                data: {
                    nombres,
                    apellidos,
                    fechaNacimiento: new Date(fechaNacimiento),
                    direcciones: {
                        create: direcciones.map(d => ({
                            direccion: d.direccion,
                            ciudad: d.ciudad,
                            distritoId: d.distritoId,
                            referenciaPrimaria: d.referenciaPrimaria,
                            referenciaEspecifica: d.referenciaEspecifica,
                            puntoReferencia: d.puntoReferencia,
                            es_ubicacion_personalizada: d.es_ubicacion_personalizada
                        }))
                    },
                    documentos: {
                        create: documentos.map(d => ({
                            tipoDocumento: d.tipoDocumento,
                            numero: d.numero
                        }))
                    }
                },
                include: {
                    direcciones: true,
                    documentos: true
                }
            });

            await registrarAuditoria({
                clienteId: nuevoCliente.id,
                accion: 'CREATE',
                detalles: nuevoCliente,
                usuarioId
            }, tx);

            return nuevoCliente;
        });
    }

    static async findAll(includeInactive: boolean = false) {
        const whereClause = includeInactive ? {} : { estado: true };
        
        return await prisma.cliente.findMany({
            where: whereClause,
            include: {
                direcciones: true,
                documentos: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    static async findById(id: string) {
        // No filtramos por estado aquí para permitir ver detalles de clientes inactivos
        const cliente = await prisma.cliente.findUnique({
            where: { id },
            include: {
                direcciones: true,
                documentos: true,
                auditorias: {
                    orderBy: {
                        fechaHora: 'desc'
                    }
                }
            }
        });

        if (!cliente) {
            throw new Error('NOT_FOUND');
        }

        return cliente;
    }

    static async update(id: string, payload: ClientePayload, usuarioId: string = 'SYSTEM') {
        const { nombres, apellidos, fechaNacimiento, direcciones, documentos } = payload;

        const clienteExistente = await prisma.cliente.findUnique({ 
            where: { id } 
        });

        if (!clienteExistente) {
            throw new Error('NOT_FOUND');
        }

        return await prisma.$transaction(async (tx) => {
            const clienteActualizado = await tx.cliente.update({
                where: { id },
                data: {
                    nombres,
                    apellidos,
                    fechaNacimiento: new Date(fechaNacimiento),
                    direcciones: {
                        deleteMany: {},
                        create: direcciones.map(d => ({
                            direccion: d.direccion,
                            ciudad: d.ciudad,
                            distritoId: d.distritoId,
                            referenciaPrimaria: d.referenciaPrimaria,
                            referenciaEspecifica: d.referenciaEspecifica,
                            puntoReferencia: d.puntoReferencia,
                            es_ubicacion_personalizada: d.es_ubicacion_personalizada
                        }))
                    },
                    documentos: {
                        deleteMany: {},
                        create: documentos.map(d => ({
                            tipoDocumento: d.tipoDocumento,
                            numero: d.numero
                        }))
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
                detalles: clienteExistente,
                usuarioId
            }, tx);

            return clienteActualizado;
        });
    }

    static async softDelete(id: string, usuarioId: string = 'SYSTEM') {
        return this.toggleEstado(id, false, usuarioId);
    }

    static async toggleEstado(id: string, nuevoEstado: boolean, usuarioId: string = 'SYSTEM') {
        const clientePrevio = await prisma.cliente.findUnique({
            where: { id },
            include: { direcciones: true, documentos: true }
        });

        if (!clientePrevio) {
            throw new Error('NOT_FOUND');
        }

        return await prisma.$transaction(async (tx) => {
            const clienteActualizado = await tx.cliente.update({
                where: { id },
                data: { estado: nuevoEstado }
            });

            await registrarAuditoria({
                clienteId: id,
                accion: nuevoEstado ? 'REACTIVATE' : 'DELETE',
                detalles: clientePrevio, 
                usuarioId
            }, tx);

            return clienteActualizado;
        });
    }

    static async exportToCSV(id?: string) {
        const whereClause = id ? { id } : { estado: true };
        
        const clientes = await prisma.cliente.findMany({
            where: whereClause,
            include: {
                direcciones: {
                    include: {
                        distrito: {
                            include: {
                                municipio: {
                                    include: {
                                        departamento: true
                                    }
                                }
                            }
                        }
                    }
                },
                documentos: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        let filename = `reporte_clientes_general_${new Date().toISOString().split('T')[0]}.csv`;

        if (id && clientes.length > 0) {
            const cliente = clientes[0];
            const nombres = cliente.nombres.replace(/\s+/g, '_').toUpperCase();
            const apellidos = cliente.apellidos.replace(/\s+/g, '_').toUpperCase();
            const idShort = cliente.id.substring(0, 8);
            filename = `cliente_${nombres}_${apellidos}_${idShort}.csv`;
        }

        const cabeceras = [
            'ID',
            'NOMBRES',
            'APELLIDOS',
            'FECHA_NACIMIENTO',
            'DIRECCIONES',
            'DEPARTAMENTO',
            'MUNICIPIO_2026',
            'DISTRITO_2026',
            'REF_PRIMARIA',
            'REF_ESPECIFICA',
            'PUNTO_REFERENCIA',
            'ES_PERSONALIZADA',
            'DOCUMENTOS',
            'ESTADO',
            'FECHA_REGISTRO'
        ];

        const filas = clientes.map(cliente => {
            const direccionesStr = cliente.direcciones.map(d => `${d.direccion} (${d.ciudad})`).join(' | ').toUpperCase();
            const departamentosStr = cliente.direcciones.map(d => d.distrito?.municipio?.departamento?.nombre || 'N/A').join(' | ').toUpperCase();
            const municipiosStr = cliente.direcciones.map(d => d.distrito?.municipio?.nombre || 'N/A').join(' | ').toUpperCase();
            const distritosStr = cliente.direcciones.map(d => d.distrito?.nombre || (d.es_ubicacion_personalizada ? 'PERSONALIZADA' : 'N/A')).join(' | ').toUpperCase();
            const refPrimariaStr = cliente.direcciones.map(d => d.referenciaPrimaria || 'N/A').join(' | ').toUpperCase();
            const refEspecificaStr = cliente.direcciones.map(d => d.referenciaEspecifica || 'N/A').join(' | ').toUpperCase();
            const puntoRefStr = cliente.direcciones.map(d => d.puntoReferencia || 'N/A').join(' | ').toUpperCase();
            const esPersonalizadaStr = cliente.direcciones.map(d => d.es_ubicacion_personalizada ? 'SI' : 'NO').join(' | ').toUpperCase();

            const documentosStr = cliente.documentos.map(d => `${d.tipoDocumento}: ${d.numero}`).join(' | ').toUpperCase();

            return [
                cliente.id,
                `"${cliente.nombres.toUpperCase()}"`,
                `"${cliente.apellidos.toUpperCase()}"`,
                cliente.fechaNacimiento.toISOString().split('T')[0],
                `"${direccionesStr}"`,
                `"${departamentosStr}"`,
                `"${municipiosStr}"`,
                `"${distritosStr}"`,
                `"${refPrimariaStr}"`,
                `"${refEspecificaStr}"`,
                `"${puntoRefStr}"`,
                `"${esPersonalizadaStr}"`,
                `"${documentosStr}"`,
                cliente.estado ? 'ACTIVO' : 'INACTIVO',
                cliente.createdAt.toISOString()
            ].join(',');
        });

        const csvContent = [cabeceras.join(','), ...filas].join('\n');
        return { csv: csvContent, filename };
    }
}
