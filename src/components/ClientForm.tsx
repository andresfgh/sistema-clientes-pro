"use client";

import { useState } from 'react';
import { ClientePayload, DireccionDTO, DocumentoDTO } from '@/core/interfaces/cliente';

interface ClientFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export default function ClientForm({ onSuccess, onCancel }: ClientFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Estado maestro del cliente
    const [nombres, setNombres] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [fechaNacimiento, setFechaNacimiento] = useState('');

    // Estados para relaciones 1:N
    const [direcciones, setDirecciones] = useState<DireccionDTO[]>([{ direccion: '', ciudad: '' }]);
    const [documentos, setDocumentos] = useState<DocumentoDTO[]>([{ tipoDocumento: 'DUI', numero: '' }]);

    // Manejadores de mutacion de arrays dinamicos
    const agregarDireccion = () => setDirecciones([...direcciones, { direccion: '', ciudad: '' }]);
    const removerDireccion = (index: number) => setDirecciones(direcciones.filter((_, i) => i !== index));
    const actualizarDireccion = (index: number, field: keyof DireccionDTO, value: string) => {
        const nuevasDirecciones = [...direcciones];
        nuevasDirecciones[index][field] = value;
        setDirecciones(nuevasDirecciones);
    };

    const agregarDocumento = () => setDocumentos([...documentos, { tipoDocumento: 'DUI', numero: '' }]);
    const removerDocumento = (index: number) => setDocumentos(documentos.filter((_, i) => i !== index));
    const actualizarDocumento = (index: number, field: keyof DocumentoDTO, value: string) => {
        const nuevosDocumentos = [...documentos];
        nuevosDocumentos[index][field] = value;
        setDocumentos(nuevosDocumentos);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const payload: ClientePayload = {
            nombres,
            apellidos,
            fechaNacimiento,
            direcciones: direcciones.filter(d => d.direccion && d.ciudad), // Limpieza de filas vacias
            documentos: documentos.filter(d => d.tipoDocumento && d.numero)
        };

        try {
            const response = await fetch('/api/clientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Fallo al registrar el cliente');
            
            onSuccess();
        } catch (err) {
            console.error('[CLIENT_SUBMIT_ERROR]', err);
            setError('Ocurrió un error al guardar el cliente. Verifique los datos.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Registrar Nuevo Cliente</h2>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded">{error}</div>}

            {/* Datos Generales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombres</label>
                    <input type="text" required value={nombres} onChange={(e) => setNombres(e.target.value)} className="w-full px-3 py-2 border rounded-md text-black outline-none focus:border-blue-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                    <input type="text" required value={apellidos} onChange={(e) => setApellidos(e.target.value)} className="w-full px-3 py-2 border rounded-md text-black outline-none focus:border-blue-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                    <input type="date" required value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} className="w-full px-3 py-2 border rounded-md text-black outline-none focus:border-blue-500" />
                </div>
            </div>

            <hr className="my-6 border-gray-200" />

            {/* Seccion Dinamica: Direcciones */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-700">Direcciones</h3>
                    <button type="button" onClick={agregarDireccion} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors">+ Añadir Dirección</button>
                </div>
                {direcciones.map((dir, index) => (
                    <div key={index} className="flex gap-4 mb-3 items-start">
                        <div className="flex-1">
                            <input type="text" placeholder="Dirección completa" required value={dir.direccion} onChange={(e) => actualizarDireccion(index, 'direccion', e.target.value)} className="w-full px-3 py-2 border rounded-md text-black outline-none focus:border-blue-500" />
                        </div>
                        <div className="flex-1">
                            <input type="text" placeholder="Ciudad" required value={dir.ciudad} onChange={(e) => actualizarDireccion(index, 'ciudad', e.target.value)} className="w-full px-3 py-2 border rounded-md text-black outline-none focus:border-blue-500" />
                        </div>
                        {direcciones.length > 1 && (
                            <button type="button" onClick={() => removerDireccion(index)} className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors">X</button>
                        )}
                    </div>
                ))}
            </div>

            <hr className="my-6 border-gray-200" />

            {/* Seccion Dinamica: Documentos */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-700">Documentos de Identificación</h3>
                    <button type="button" onClick={agregarDocumento} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors">+ Añadir Documento</button>
                </div>
                {documentos.map((doc, index) => (
                    <div key={index} className="flex gap-4 mb-3 items-start">
                        <div className="w-1/3">
                            <select value={doc.tipoDocumento} onChange={(e) => actualizarDocumento(index, 'tipoDocumento', e.target.value)} className="w-full px-3 py-2 border rounded-md text-black outline-none focus:border-blue-500 bg-white">
                                <option value="DUI">DUI</option>
                                <option value="NIT">NIT</option>
                                <option value="Pasaporte">Pasaporte</option>
                            </select>
                        </div>
                        <div className="flex-1">
                            <input type="text" placeholder="Número de documento" required value={doc.numero} onChange={(e) => actualizarDocumento(index, 'numero', e.target.value)} className="w-full px-3 py-2 border rounded-md text-black outline-none focus:border-blue-500" />
                        </div>
                        {documentos.length > 1 && (
                            <button type="button" onClick={() => removerDocumento(index)} className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors">X</button>
                        )}
                    </div>
                ))}
            </div>

            {/* Acciones de Formulario */}
            <div className="flex justify-end gap-4 mt-8">
                <button type="button" onClick={onCancel} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                    Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors">
                    {isSubmitting ? 'Guardando...' : 'Guardar Cliente'}
                </button>
            </div>
        </form>
    );
}