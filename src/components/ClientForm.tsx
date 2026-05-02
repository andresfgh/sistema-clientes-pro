// src/components/ClientForm.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { ClientePayload, DireccionDTO, DocumentoDTO, ClienteResponse, AuditoriaDTO } from '@/core/interfaces/cliente';

interface ClientFormProps {
    clienteToEdit?: ClienteResponse | null;
    isReadOnly?: boolean;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function ClientForm({ clienteToEdit, isReadOnly = false, onSuccess, onCancel }: ClientFormProps) {
    const isEditMode = !!clienteToEdit;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [nombres, setNombres] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [fechaNacimiento, setFechaNacimiento] = useState('');

    const [direcciones, setDirecciones] = useState<DireccionDTO[]>([{ direccion: '', ciudad: '' }]);
    const [documentos, setDocumentos] = useState<DocumentoDTO[]>([{ tipoDocumento: 'DUI', numero: '' }]);
    
    const [auditorias, setAuditorias] = useState<AuditoriaDTO[]>([]);

    // Catálogos geográficos para la cascada SV 2026
    const [catalogos, setCatalogos] = useState<{
        departamentos: any[];
        municipios: Record<string, any[]>;
        distritos: Record<string, any[]>;
    }>({
        departamentos: [],
        municipios: {},
        distritos: {}
    });

    useEffect(() => {
        // Carga inicial de departamentos
        const fetchDeptos = async () => {
            try {
                const res = await fetch('/api/geografia?type=departamentos');
                if (res.ok) {
                    const data = await res.json();
                    setCatalogos(prev => ({ ...prev, departamentos: data }));
                }
            } catch (err) {
                console.error('Error al cargar departamentos', err);
            }
        };
        fetchDeptos();
    }, []);

    const fetchMunicipios = async (deptoId: string) => {
        if (catalogos.municipios[deptoId]) return;
        try {
            const res = await fetch(`/api/geografia?type=municipios&parentId=${deptoId}`);
            if (res.ok) {
                const data = await res.json();
                setCatalogos(prev => ({
                    ...prev,
                    municipios: { ...prev.municipios, [deptoId]: data }
                }));
            }
        } catch (err) {
            console.error('Error al cargar municipios', err);
        }
    };

    const fetchDistritos = async (muniId: string) => {
        if (catalogos.distritos[muniId]) return;
        try {
            const res = await fetch(`/api/geografia?type=distritos&parentId=${muniId}`);
            if (res.ok) {
                const data = await res.json();
                setCatalogos(prev => ({
                    ...prev,
                    distritos: { ...prev.distritos, [muniId]: data }
                }));
            }
        } catch (err) {
            console.error('Error al cargar distritos', err);
        }
    };

    useEffect(() => {
        if (clienteToEdit) {
            setNombres(clienteToEdit.nombres);
            setApellidos(clienteToEdit.apellidos);
            const dateStr = new Date(clienteToEdit.fechaNacimiento).toISOString().split('T')[0];
            setFechaNacimiento(dateStr);
            
            if (clienteToEdit.direcciones.length > 0) {
                // Al editar, necesitamos cargar los catálogos correspondientes para que se vean los selectores
                clienteToEdit.direcciones.forEach(dir => {
                    if (dir.departamentoId) fetchMunicipios(dir.departamentoId);
                    if (dir.municipioId) fetchDistritos(dir.municipioId);
                });
                setDirecciones(clienteToEdit.direcciones.map(d => ({ ...d })));
            }
            if (clienteToEdit.documentos.length > 0) {
                setDocumentos(clienteToEdit.documentos.map(d => ({ tipoDocumento: d.tipoDocumento, numero: d.numero })));
            }
            if (clienteToEdit.auditorias) {
                setAuditorias(clienteToEdit.auditorias);
            }
        }
    }, [clienteToEdit]);

    const agregarDireccion = () => setDirecciones([...direcciones, { direccion: '', ciudad: '' }]);
    const removerDireccion = (index: number) => setDirecciones(direcciones.filter((_: DireccionDTO, i: number) => i !== index));
    
    const actualizarDireccion = <K extends keyof DireccionDTO>(index: number, field: K, value: DireccionDTO[K]) => {
        const nuevas = [...direcciones];
        nuevas[index][field] = value;
        setDirecciones(nuevas);
    };

    const agregarDocumento = () => setDocumentos([...documentos, { tipoDocumento: 'DUI', numero: '' }]);
    const removerDocumento = (index: number) => setDocumentos(documentos.filter((_: DocumentoDTO, i: number) => i !== index));
    const actualizarDocumento = (index: number, field: keyof DocumentoDTO, value: string) => {
        const nuevos = [...documentos];
        if (field === 'numero') {
            nuevos[index][field] = value.replace(/\D/g, '');
        } else {
            nuevos[index][field] = value;
        }
        setDocumentos(nuevos);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isReadOnly) return;
        
        setError(null);
        setIsSubmitting(true);

        const payload: ClientePayload = {
            nombres,
            apellidos,
            fechaNacimiento,
            direcciones: direcciones.filter((d: DireccionDTO) => d.direccion && d.ciudad),
            documentos: documentos.filter((d: DocumentoDTO) => d.tipoDocumento && d.numero)
        };

        try {
            const endpoint = isEditMode ? `/api/clientes/${clienteToEdit.id}` : '/api/clientes';
            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Fallo al procesar la solicitud');
            }
            
            onSuccess();
        } catch (err: any) {
            console.error('[CLIENT_SUBMIT_ERROR]', err);
            setError(err.message || 'Error al guardar el cliente. Verifique los datos.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatAction = (accion: string) => {
        switch(accion) {
            case 'CREATE': return 'Creación de Cliente';
            case 'UPDATE': return 'Actualización de Datos';
            case 'DELETE': return 'Inactivación de Cliente';
            case 'REACTIVATE': return 'Reactivación de Cliente';
            default: return accion;
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-300 rounded shadow-none">
            <div className="bg-slate-100 border-b border-slate-300 px-4 py-2">
                <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-tight">
                    {isReadOnly ? 'Detalles del Cliente' : (isEditMode ? 'Editar Cliente' : 'Registrar Nuevo Cliente')}
                </h2>
            </div>
            
            <div className="p-4">
                {error && <div className="mb-4 px-3 py-2 bg-red-100 border border-red-300 text-red-800 text-sm rounded-sm font-medium">{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Nombres</label>
                        <input type="text" required value={nombres} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNombres(e.target.value)} disabled={isReadOnly} className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-sm text-sm outline-none focus:border-primary-brand disabled:bg-slate-100 disabled:text-slate-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Apellidos</label>
                        <input type="text" required value={apellidos} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApellidos(e.target.value)} disabled={isReadOnly} className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-sm text-sm outline-none focus:border-primary-brand disabled:bg-slate-100 disabled:text-slate-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Fecha Nacimiento</label>
                        <input type="date" required value={fechaNacimiento} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFechaNacimiento(e.target.value)} disabled={isReadOnly} className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-sm text-sm outline-none focus:border-primary-brand disabled:bg-slate-100 disabled:text-slate-500" />
                    </div>
                </div>

                <div className="mb-6 border border-slate-300 rounded-sm overflow-hidden">
                    <div className="bg-slate-50 px-3 py-2 border-b border-slate-300 flex justify-between items-center">
                        <h3 className="text-xs font-bold text-slate-700 uppercase">Gestión de Direcciones (División SV 2026)</h3>
                        {!isReadOnly && (
                            <button type="button" onClick={agregarDireccion} className="text-[10px] uppercase font-bold bg-slate-200 border border-slate-300 text-slate-700 px-2 py-1 rounded-sm hover:bg-slate-300 transition-colors">
                                + Añadir Dirección
                            </button>
                        )}
                    </div>
                    <div className="divide-y divide-slate-200 bg-white">
                        {direcciones.map((dir: DireccionDTO, index: number) => (
                            <div key={index} className="p-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Departamento</label>
                                        <select 
                                            value={dir.departamentoId || ''} 
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                actualizarDireccion(index, 'departamentoId', val);
                                                actualizarDireccion(index, 'municipioId', '');
                                                actualizarDireccion(index, 'distritoId', '');
                                                if (val) fetchMunicipios(val);
                                            }}
                                            disabled={isReadOnly}
                                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-sm text-xs outline-none focus:border-primary-brand disabled:bg-slate-100"
                                        >
                                            <option value="">SELECCIONE...</option>
                                            {catalogos.departamentos.map(d => (
                                                <option key={d.id} value={d.id}>{d.nombre.toUpperCase()}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Municipio</label>
                                        <select 
                                            value={dir.municipioId || ''} 
                                            disabled={!dir.departamentoId || isReadOnly}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                actualizarDireccion(index, 'municipioId', val);
                                                actualizarDireccion(index, 'distritoId', '');
                                                if (val) fetchDistritos(val);
                                            }}
                                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-sm text-xs outline-none focus:border-primary-brand disabled:bg-slate-100"
                                        >
                                            <option value="">SELECCIONE...</option>
                                            {(catalogos.municipios[dir.departamentoId || ''] || []).map(m => (
                                                <option key={m.id} value={m.id}>{m.nombre.toUpperCase()}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {dir.municipioId && (
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Distrito</label>
                                            <select 
                                                value={dir.distritoId || ''} 
                                                disabled={isReadOnly}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    actualizarDireccion(index, 'distritoId', val);
                                                    // Sincronizar ciudad con el nombre del distrito para normalización
                                                    const dist = catalogos.distritos[dir.municipioId || ''].find(d => d.id === val);
                                                    if (dist) actualizarDireccion(index, 'ciudad', dist.nombre.toUpperCase());
                                                }}
                                                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-sm text-xs outline-none focus:border-primary-brand disabled:bg-slate-100"
                                            >
                                                <option value="">SELECCIONE...</option>
                                                {(catalogos.distritos[dir.municipioId || ''] || []).map(dist => (
                                                    <option key={dist.id} value={dist.id}>{dist.nombre.toUpperCase()}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="md:col-span-3">
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Dirección Completa (Calle/Avenida)</label>
                                        <input type="text" placeholder="EJ: 1RA CALLE PONIENTE #12-B" required value={dir.direccion} onChange={(e) => actualizarDireccion(index, 'direccion', e.target.value)} disabled={isReadOnly} className="w-full px-3 py-1.5 border border-slate-300 rounded-sm text-sm outline-none focus:border-primary-brand disabled:bg-slate-100 uppercase" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Ciudad/Zona</label>
                                        <input type="text" placeholder="EJ: CENTRO HISTÓRICO" required value={dir.ciudad} onChange={(e) => actualizarDireccion(index, 'ciudad', e.target.value)} disabled={isReadOnly} className="w-full px-3 py-1.5 border border-slate-300 rounded-sm text-sm outline-none focus:border-primary-brand disabled:bg-slate-100 uppercase" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Referencia Primaria (Colonia/Residencial)</label>
                                        <input type="text" value={dir.referenciaPrimaria || ''} onChange={(e) => actualizarDireccion(index, 'referenciaPrimaria', e.target.value)} disabled={isReadOnly} className="w-full px-3 py-1.5 border border-slate-300 rounded-sm text-xs outline-none focus:border-primary-brand disabled:bg-slate-100 uppercase" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Referencia Específica (Pasaje/Casa)</label>
                                        <input type="text" value={dir.referenciaEspecifica || ''} onChange={(e) => actualizarDireccion(index, 'referenciaEspecifica', e.target.value)} disabled={isReadOnly} className="w-full px-3 py-1.5 border border-slate-300 rounded-sm text-xs outline-none focus:border-primary-brand disabled:bg-slate-100 uppercase" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Punto de Referencia</label>
                                        <input type="text" value={dir.puntoReferencia || ''} onChange={(e) => actualizarDireccion(index, 'puntoReferencia', e.target.value)} disabled={isReadOnly} className="w-full px-3 py-1.5 border border-slate-300 rounded-sm text-xs outline-none focus:border-primary-brand disabled:bg-slate-100 uppercase" />
                                    </div>
                                </div>

                                {!isReadOnly && direcciones.length > 1 && (
                                    <div className="flex justify-end">
                                        <button type="button" onClick={() => removerDireccion(index)} className="text-[10px] font-bold text-red-600 hover:text-red-800 uppercase flex items-center gap-1 transition-colors">
                                            <span>×</span> Eliminar esta dirección
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-6 border border-slate-300 rounded-sm overflow-hidden">
                    <div className="bg-slate-50 px-3 py-2 border-b border-slate-300 flex justify-between items-center">
                        <h3 className="text-xs font-bold text-slate-700 uppercase">Identificación Oficial</h3>
                        {!isReadOnly && (
                            <button type="button" onClick={agregarDocumento} className="text-[10px] uppercase font-bold bg-slate-200 border border-slate-300 text-slate-700 px-2 py-1 rounded-sm hover:bg-slate-300 transition-colors">
                                + Añadir Documento
                            </button>
                        )}
                    </div>
                    <div className="p-3 space-y-3 bg-white">
                        {documentos.map((doc, index) => (
                            <div key={index} className="flex gap-2 items-center">
                                <select value={doc.tipoDocumento} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => actualizarDocumento(index, 'tipoDocumento', e.target.value)} disabled={isReadOnly} className="w-1/4 px-3 py-1.5 border border-slate-300 rounded-sm text-sm outline-none focus:border-primary-brand disabled:bg-slate-100 uppercase font-medium">
                                    <option value="DUI">DUI</option>
                                    <option value="NIT">NIT</option>
                                    <option value="PASAPORTE">PASAPORTE</option>
                                </select>
                                <input type="text" placeholder="NUMERO DE DOCUMENTO" required value={doc.numero} onChange={(e: React.ChangeEvent<HTMLInputElement>) => actualizarDocumento(index, 'numero', e.target.value)} disabled={isReadOnly} className="flex-1 px-3 py-1.5 border border-slate-300 rounded-sm text-sm outline-none focus:border-primary-brand disabled:bg-slate-100" />
                                {!isReadOnly && documentos.length > 1 && (
                                    <button type="button" onClick={() => removerDocumento(index)} className="px-2 text-red-600 hover:text-red-800 text-[10px] font-bold uppercase transition-colors">
                                        Eliminar
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {isReadOnly && auditorias.length > 0 && (
                    <div className="mb-6 border border-slate-300 rounded-sm overflow-hidden">
                        <div className="bg-slate-50 px-3 py-2 border-b border-slate-300">
                            <h3 className="text-xs font-bold text-slate-700 uppercase">Bitácora de Auditoría</h3>
                        </div>
                        <div className="p-0 overflow-x-auto">
                            <table className="w-full text-left text-xs divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-3 py-2 font-bold text-slate-600 uppercase">Acción</th>
                                        <th className="px-3 py-2 font-bold text-slate-600 uppercase">Usuario</th>
                                        <th className="px-3 py-2 font-bold text-slate-600 uppercase text-right">Fecha y Hora</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {auditorias.map((audit: AuditoriaDTO) => (
                                        <tr key={audit.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-3 py-2 font-semibold text-slate-800">{formatAction(audit.accion).toUpperCase()}</td>
                                            <td className="px-3 py-2 text-slate-600">{audit.usuarioId.toUpperCase()}</td>
                                            <td className="px-3 py-2 text-slate-500 font-mono text-right">{new Date(audit.fechaHora).toLocaleString('es-ES').toUpperCase()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-slate-50 px-4 py-3 border-t border-slate-300 flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="px-4 py-1.5 bg-slate-200 border border-slate-300 text-slate-800 rounded-sm hover:bg-slate-300 transition-colors text-xs font-bold uppercase">
                    {isReadOnly ? 'Cerrar Vista' : 'Cancelar'}
                </button>
                {!isReadOnly && (
                    <button type="submit" disabled={isSubmitting} className="px-6 py-1.5 bg-primary-brand text-white rounded-sm hover:opacity-90 disabled:opacity-50 transition-opacity text-xs font-bold uppercase">
                        {isSubmitting ? 'Procesando...' : 'Guardar Cliente'}
                    </button>
                )}
            </div>
        </form>
    );
}