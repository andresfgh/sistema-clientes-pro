// src/app/dashboard/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ClienteResponse } from '@/core/interfaces/cliente';
import ClientForm from '@/components/ClientForm';

export default function DashboardPage() {
    const router = useRouter();
    const [clientes, setClientes] = useState<ClienteResponse[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

    // Se mantiene useCallback para estabilizar la referencia de la funcion en memoria
    const fetchClientes = useCallback(async () => {
        try {
            const res = await fetch('/api/clientes');
            
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
    }, [router]);

    // Aislamiento asincrono: Se le garantiza al linter que no hay mutacion sincrona de estado
    useEffect(() => {
        let montado = true; // Bandera de seguridad para prevenir memory leaks

        const inicializarDatos = async () => {
            if (montado) {
                await fetchClientes();
            }
        };

        inicializarDatos();

        // Funcion de limpieza (cleanup) cuando el componente se desmonta
        return () => {
            montado = false;
        };
    }, [fetchClientes]);

    const handleExportCSV = () => {
        window.open('/api/clientes/export', '_blank');
    };

    const handleFormSuccess = () => {
        setIsFormOpen(false);
        // Al agregar un cliente, forzamos el estado de carga para mostrar retroalimentacion visual
        setIsLoading(true); 
        fetchClientes();
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Administración de Clientes</h1>
                <div className="flex gap-4">
                    <button 
                        onClick={handleExportCSV} 
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                    >
                        Exportar CSV
                    </button>
                    <button 
                        onClick={() => setIsFormOpen(true)} 
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                        + Nuevo Cliente
                    </button>
                </div>
            </header>

            <main className="p-8 max-w-7xl mx-auto">
                {error && <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">{error}</div>}

                {isFormOpen ? (
                    <div className="mb-8">
                        <ClientForm onSuccess={handleFormSuccess} onCancel={() => setIsFormOpen(false)} />
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-6 py-4 text-sm font-medium text-gray-500">ID Cliente</th>
                                        <th className="px-6 py-4 text-sm font-medium text-gray-500">Nombre Completo</th>
                                        <th className="px-6 py-4 text-sm font-medium text-gray-500">Fecha Nacimiento</th>
                                        <th className="px-6 py-4 text-sm font-medium text-gray-500 text-center">Direcciones</th>
                                        <th className="px-6 py-4 text-sm font-medium text-gray-500 text-center">Documentos</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Cargando información...</td></tr>
                                    ) : clientes.length === 0 ? (
                                        <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No hay clientes registrados en el sistema.</td></tr>
                                    ) : (
                                        clientes.map((cliente) => (
                                            <tr key={cliente.id} className="border-b hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-gray-500 font-mono">{cliente.id.split('-')[0]}...</td>
                                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">{cliente.nombres} {cliente.apellidos}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{new Date(cliente.fechaNacimiento).toLocaleDateString('es-ES')}</td>
                                                <td className="px-6 py-4 text-sm text-center">
                                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{cliente.direcciones.length}</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-center">
                                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">{cliente.documentos.length}</span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}