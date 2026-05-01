// src/components/ClientForm.tsx
"use client";

import { useState, useEffect } from 'react';
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

    useEffect(() => {
        if (clienteToEdit) {
            setNombres(clienteToEdit.nombres);
            setApellidos(clienteToEdit.apellidos);
            const dateStr = new Date(clienteToEdit.fechaNacimiento).toISOString().split('T')[0];
            setFechaNacimiento(dateStr);
            
            if (clienteToEdit.direcciones.length > 0) {
                setDirecciones(clienteToEdit.direcciones.map(d => ({ direccion: d.direccion, ciudad: d.ciudad })));
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
    const removerDireccion = (index: number) => setDirecciones(direcciones.filter((_, i) => i !== index));
    const actualizarDireccion = (index: number, field: keyof DireccionDTO, value: string) => {
        const nuevas = [...direcciones];
        nuevas[index][field] = value;
        setDirecciones(nuevas);
    };

    const agregarDocumento = () => setDocumentos([...documentos, { tipoDocumento: 'DUI', numero: '' }]);
    const removerDocumento = (index: number) => setDocumentos(documentos.filter((_, i) => i !== index));
    const actualizarDocumento = (index: number, field: keyof DocumentoDTO, value: string) => {
        const nuevos = [...documentos];
        // Valida el formato del documento antes del envío
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
            direcciones: direcciones.filter(d => d.direccion && d.ciudad),
            documentos: documentos.filter(d => d.tipoDocumento && d.numero)
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
                <h2 className="text-sm font-semibold text-slate-800">
                    {isReadOnly ? 'Detalles del Cliente' : (isEditMode ? 'Editar Cliente' : 'Registrar Nuevo Cliente')}
                </h2>
            </div>
            
            <div className="p-4">
                {error && <div className="mb-4 px-3 py-2 bg-red-100 border border-red-300 text-red-800 text-sm rounded-sm">{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Nombres</label>
                        <input type="text" required value={nombres} onChange={(e) => setNombres(e.target.value)} disabled={isReadOnly} className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-sm text-sm outline-none focus:border-primary-brand disabled:bg-slate-100 disabled:text-slate-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Apellidos</label>
                        <input type="text" required value={apellidos} onChange={(e) => setApellidos(e.target.value)} disabled={isReadOnly} className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-sm text-sm outline-none focus:border-primary-brand disabled:bg-slate-100 disabled:text-slate-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Fecha Nacimiento</label>
                        <input type="date" required value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} disabled={isReadOnly} className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-sm text-sm outline-none focus:border-primary-brand disabled:bg-slate-100 disabled:text-slate-500" />
                    </div>
                </div>

                <div className="mb-6 border border-slate-300 rounded-sm">
                    <div className="bg-slate-50 px-3 py-2 border-b border-slate-300 flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-slate-800">Direcciones</h3>
                        {!isReadOnly && (
                            <button type="button" onClick={agregarDireccion} className="text-xs bg-slate-200 border border-slate-300 text-slate-700 px-2 py-1 rounded-sm hover:bg-slate-300">
                                Agregar Dirección
                            </button>
                        )}
                    </div>
                    <div className="p-3 space-y-3 bg-white">
                        {direcciones.map((dir, index) => (
                            <div key={index} className="flex gap-2 items-center">
                                <input type="text" placeholder="Dirección completa" required value={dir.direccion} onChange={(e) => actualizarDireccion(index, 'direccion', e.target.value)} disabled={isReadOnly} className="flex-1 px-3 py-1.5 border border-slate-300 rounded-sm text-sm outline-none focus:border-primary-brand disabled:bg-slate-100" />
                                <input type="text" placeholder="Ciudad" required value={dir.ciudad} onChange={(e) => actualizarDireccion(index, 'ciudad', e.target.value)} disabled={isReadOnly} className="w-1/3 px-3 py-1.5 border border-slate-300 rounded-sm text-sm outline-none focus:border-primary-brand disabled:bg-slate-100" />
                                {!isReadOnly && direcciones.length > 1 && (
                                    <button type="button" onClick={() => removerDireccion(index)} className="px-2 text-red-600 hover:underline text-sm">
                                        Eliminar
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-6 border border-slate-300 rounded-sm">
                    <div className="bg-slate-50 px-3 py-2 border-b border-slate-300 flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-slate-800">Documentos</h3>
                        {!isReadOnly && (
                            <button type="button" onClick={agregarDocumento} className="text-xs bg-slate-200 border border-slate-300 text-slate-700 px-2 py-1 rounded-sm hover:bg-slate-300">
                                Agregar Documento
                            </button>
                        )}
                    </div>
                    <div className="p-3 space-y-3 bg-white">
                        {documentos.map((doc, index) => (
                            <div key={index} className="flex gap-2 items-center">
                                <select value={doc.tipoDocumento} onChange={(e) => actualizarDocumento(index, 'tipoDocumento', e.target.value)} disabled={isReadOnly} className="w-1/4 px-3 py-1.5 border border-slate-300 rounded-sm text-sm outline-none focus:border-primary-brand disabled:bg-slate-100">
                                    <option value="DUI">DUI</option>
                                    <option value="NIT">NIT</option>
                                    <option value="Pasaporte">Pasaporte</option>
                                </select>
                                <input type="text" placeholder="Número" required value={doc.numero} onChange={(e) => actualizarDocumento(index, 'numero', e.target.value)} disabled={isReadOnly} className="flex-1 px-3 py-1.5 border border-slate-300 rounded-sm text-sm outline-none focus:border-primary-brand disabled:bg-slate-100" />
                                {!isReadOnly && documentos.length > 1 && (
                                    <button type="button" onClick={() => removerDocumento(index)} className="px-2 text-red-600 hover:underline text-sm">
                                        Eliminar
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {isReadOnly && auditorias.length > 0 && (
                    <div className="mb-6 border border-slate-300 rounded-sm">
                        <div className="bg-slate-50 px-3 py-2 border-b border-slate-300">
                            <h3 className="text-sm font-semibold text-slate-800">Trazabilidad</h3>
                        </div>
                        <div className="p-0">
                            <table className="w-full text-left text-sm divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-3 py-2 font-semibold text-slate-700">Acción</th>
                                        <th className="px-3 py-2 font-semibold text-slate-700">Usuario</th>
                                        <th className="px-3 py-2 font-semibold text-slate-700">Fecha y Hora</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {auditorias.map((audit) => (
                                        <tr key={audit.id} className="hover:bg-slate-50">
                                            <td className="px-3 py-2 font-medium">{formatAction(audit.accion)}</td>
                                            <td className="px-3 py-2 text-slate-600">{audit.usuarioId}</td>
                                            <td className="px-3 py-2 text-slate-600 font-mono">{new Date(audit.fechaHora).toLocaleString('es-ES')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-slate-50 px-4 py-3 border-t border-slate-300 flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="px-3 py-1.5 bg-slate-200 border border-slate-300 text-slate-800 rounded-sm hover:bg-slate-300 text-sm">
                    {isReadOnly ? 'Cerrar' : 'Cancelar'}
                </button>
                {!isReadOnly && (
                    <button type="submit" disabled={isSubmitting} className="px-3 py-1.5 bg-primary-brand text-white rounded-sm hover:opacity-90 disabled:opacity-50 text-sm">
                        {isSubmitting ? 'Guardando...' : 'Guardar'}
                    </button>
                )}
            </div>
        </form>
    );
}