"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ClienteResponse } from '@/core/interfaces/cliente';
import ClientForm from '@/components/ClientForm';

/**
 * Desarrollado por andresfgh (https://github.com/andresfgh)
 * Sistema de Gestión de Clientes - Versión Administrativa
 */
export default function DashboardPage() {
    const router = useRouter();
    const [clientes, setClientes] = useState<ClienteResponse[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [clienteToEdit, setClienteToEdit] = useState<ClienteResponse | null>(null);
    const [isReadOnly, setIsReadOnly] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [showInactivos, setShowInactivos] = useState<boolean>(false);

    // Obtiene el listado de clientes evaluando el filtro de inactivos
    const fetchClientes = useCallback(async () => {
        try {
            const endpoint = showInactivos ? '/api/clientes?inactivos=true' : '/api/clientes';
            const res = await fetch(endpoint);
            
            if (res.status === 401) {
                router.push('/login');
                return;
            }

            if (!res.ok) throw new Error('Fallo al recuperar la información');

            const data = await res.json();
            setClientes(data);
            setError(null);
        } catch (err) {
            console.error('[DASHBOARD_FETCH_ERROR]', err);
            setError('Error de conexión al cargar los clientes.');
        } finally {
            setIsLoading(false);
        }
    }, [router, showInactivos]);

    useEffect(() => {
        let montado = true;

        const inicializarDatos = async () => {
            if (montado) {
                await fetchClientes();
            }
        };

        inicializarDatos();

        return () => {
            montado = false;
        };
    }, [fetchClientes]);

    const handleExportCSV = () => {
        window.open('/api/clientes/export', '_blank');
    };

    const handleExportSingleCSV = (id: string) => {
        window.open(`/api/clientes/export?id=${id}`, '_blank');
    };

    const handleFormSuccess = () => {
        setIsFormOpen(false);
        setClienteToEdit(null);
        setIsReadOnly(false);
        setIsLoading(true); 
        fetchClientes();
    };

    const handleCancelForm = () => {
        setIsFormOpen(false);
        setClienteToEdit(null);
        setIsReadOnly(false);
    };

    const handleEdit = (cliente: ClienteResponse) => {
        setClienteToEdit(cliente);
        setIsReadOnly(false);
        setIsFormOpen(true);
    };

    // Carga los detalles completos del cliente para la vista de solo lectura
    const handleView = async (id: string) => {
        try {
            const res = await fetch(`/api/clientes/${id}`);
            if (!res.ok) throw new Error('Fallo al cargar el cliente completo');
            const clienteCompleto = await res.json();
            
            setClienteToEdit(clienteCompleto);
            setIsReadOnly(true);
            setIsFormOpen(true);
        } catch (err) {
            console.error(err);
            setError('No se pudo cargar el detalle del cliente');
        }
    };

    // Modifica el estado del cliente enviando la peticion PATCH al API
    const handleToggleEstado = async (id: string, nuevoEstado: boolean) => {
        const accionStr = nuevoEstado ? 'reactivar' : 'eliminar';
        if (!window.confirm(`¿Estás seguro de que deseas ${accionStr} este cliente?`)) {
            return;
        }

        setIsDeleting(id);
        setError(null);

        try {
            const res = await fetch(`/api/clientes/${id}/estado`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Author': 'andresfgh',
                    'X-Source': 'https://github.com/andresfgh'
                },
                body: JSON.stringify({ estado: nuevoEstado })
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.error || `No se pudo ${accionStr} el cliente`);
            }

            await fetchClientes();
        } catch (err: any) {
            console.error('[DASHBOARD_TOGGLE_ERROR]', err);
            setError(err.message || `Error de conexión al intentar ${accionStr} el cliente.`);
        } finally {
            setIsDeleting(null);
        }
    };

    // Cierra la sesión activa
    const handleLogout = () => {
        document.cookie = 'token=; Max-Age=0; path=/;';
        localStorage.clear();
        router.replace('/login');
    };

    return (
        <div className="min-h-screen bg-white font-sans antialiased">
            <header className="bg-slate-50 border-b border-slate-300 px-4 py-3 flex justify-between items-center">
                <h1 className="text-lg font-bold text-slate-800">Administración de Clientes</h1>
                <div className="flex gap-2">
                    <button 
                        title="Exportar todos los clientes a CSV"
                        onClick={handleExportCSV} 
                        className="bg-slate-200 border border-slate-300 text-slate-800 hover:bg-slate-300 px-3 py-1.5 rounded-sm text-sm transition-none"
                    >
                        Exportar CSV
                    </button>
                    <button 
                        onClick={() => {
                            setClienteToEdit(null);
                            setIsReadOnly(false);
                            setIsFormOpen(true);
                        }} 
                        className="bg-primary-brand hover:opacity-90 text-white px-3 py-1.5 rounded-sm text-sm transition-none"
                    >
                        Nuevo Cliente
                    </button>
                    <span className="w-px bg-slate-300 mx-1"></span>
                    <button 
                        onClick={handleLogout}
                        className="bg-white border border-slate-300 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 px-3 py-1.5 rounded-sm text-sm transition-none flex items-center gap-1"
                        title="Cerrar Sesión"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        Salir
                    </button>
                </div>
            </header>

            <main className="px-4 py-4 max-w-full">
                {error && (
                    <div className="mb-4 px-3 py-2 bg-red-100 border border-red-300 text-red-800 rounded-sm text-sm flex items-center justify-between">
                        <span>{error}</span>
                        <button onClick={() => setError(null)} className="text-red-800 font-bold ml-4">&times;</button>
                    </div>
                )}

                {isFormOpen ? (
                    <div className="mb-6">
                        <ClientForm 
                            clienteToEdit={clienteToEdit} 
                            isReadOnly={isReadOnly}
                            onSuccess={handleFormSuccess} 
                            onCancel={handleCancelForm} 
                        />
                    </div>
                ) : (
                    <>
                        <div className="mb-3 flex justify-between items-center">
                            <span className="text-sm font-semibold text-slate-700">Listado de Clientes</span>
                            <label className="flex items-center gap-1.5 text-sm text-slate-700">
                                <input 
                                    type="checkbox" 
                                    checked={showInactivos} 
                                    onChange={(e) => setShowInactivos(e.target.checked)}
                                    className="rounded-sm border-slate-400"
                                />
                                Mostrar inactivos
                            </label>
                        </div>

                        <div className="border border-slate-300 rounded overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left whitespace-nowrap bg-white divide-y divide-slate-200">
                                    <thead className="bg-slate-100 border-b-2 border-slate-300">
                                        <tr>
                                            <th className="px-3 py-2 text-sm font-semibold text-slate-800">ID Cliente</th>
                                            <th className="px-3 py-2 text-sm font-semibold text-slate-800">Nombre Completo</th>
                                            <th className="px-3 py-2 text-sm font-semibold text-slate-800">Fecha Nacimiento</th>
                                            <th className="px-3 py-2 text-sm font-semibold text-slate-800 text-center">Estado</th>
                                            <th className="px-3 py-2 text-sm font-semibold text-slate-800 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {isLoading ? (
                                            <tr><td colSpan={5} className="px-3 py-4 text-center text-slate-600 text-sm">Cargando información...</td></tr>
                                        ) : clientes.length === 0 ? (
                                            <tr><td colSpan={5} className="px-3 py-4 text-center text-slate-600 text-sm">No hay registros.</td></tr>
                                        ) : (
                                            clientes.map((cliente) => (
                                                <tr key={cliente.id} className={!cliente.estado ? 'bg-slate-50 text-slate-500' : 'hover:bg-slate-50'}>
                                                    <td className="px-3 py-2 text-sm text-slate-700 font-mono">{cliente.id.substring(0,8)}</td>
                                                    <td className="px-3 py-2 text-sm text-slate-900">{cliente.nombres} {cliente.apellidos}</td>
                                                    <td className="px-3 py-2 text-sm text-slate-700">{new Date(cliente.fechaNacimiento).toLocaleDateString('es-ES')}</td>
                                                    <td className="px-3 py-2 text-sm text-center">
                                                        {cliente.estado ? (
                                                            <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs border border-green-200">Activo</span>
                                                        ) : (
                                                            <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-xs border border-red-200">Inactivo</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-right">
                                                        <div className="flex justify-end gap-2 text-blue-600">
                                                            <button 
                                                                onClick={() => handleView(cliente.id)}
                                                                className="hover:underline"
                                                            >
                                                                Ver
                                                            </button>
                                                            
                                                            {cliente.estado && (
                                                                <>
                                                                    <span className="text-slate-300">|</span>
                                                                    <button 
                                                                        onClick={() => handleExportSingleCSV(cliente.id)}
                                                                        className="hover:underline"
                                                                    >
                                                                        CSV
                                                                    </button>
                                                                </>
                                                            )}

                                                            <span className="text-slate-300">|</span>
                                                            <button 
                                                                onClick={() => handleEdit(cliente)}
                                                                disabled={!cliente.estado || isDeleting === cliente.id}
                                                                className={`hover:underline ${!cliente.estado ? 'text-slate-400 no-underline cursor-not-allowed' : ''}`}
                                                            >
                                                                Editar
                                                            </button>
                                                            
                                                            <span className="text-slate-300">|</span>
                                                            {cliente.estado ? (
                                                                <button 
                                                                    onClick={() => handleToggleEstado(cliente.id, false)}
                                                                    disabled={isDeleting === cliente.id}
                                                                    className="text-red-600 hover:underline disabled:opacity-50"
                                                                >
                                                                    {isDeleting === cliente.id ? '...' : 'Eliminar'}
                                                                </button>
                                                            ) : (
                                                                <button 
                                                                    onClick={() => handleToggleEstado(cliente.id, true)}
                                                                    disabled={isDeleting === cliente.id}
                                                                    className="text-green-600 hover:underline disabled:opacity-50"
                                                                >
                                                                    {isDeleting === cliente.id ? '...' : 'Reactivar'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </main>
            <footer className="mt-auto py-4 border-t border-slate-200">
                <p className="text-center text-[10px] text-slate-400">
                    Sistema de Gestión de Clientes | Creado por <a href="https://github.com/andresfgh" target="_blank" rel="noopener noreferrer" className="hover:text-primary-brand underline">andresfgh</a>
                </p>
            </footer>
        </div>
    );
}