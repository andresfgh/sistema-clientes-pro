"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Componente de presentacion y logica para la autenticacion de usuarios
export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const username = formData.get('username');
        const password = formData.get('password');

        try {
            // La peticion se envia a nuestra propia ruta de API
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (res.ok) {
                // La cookie HttpOnly se establece automaticamente en el navegador.
                // Redireccion forzada al area segura.
                router.push('/dashboard');
                router.refresh(); 
            } else {
                const data = await res.json();
                setError(data.error || 'Credenciales inválidas');
            }
        } catch (err) {
            console.error('[LOGIN_ERROR]', err);
            setError('Error de conexión con el servidor');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Sistema de Clientes</h1>
                    <p className="text-gray-500 text-sm mt-2">Ingrese sus credenciales de acceso</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="username">
                            Usuario
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-black"
                            placeholder="Ej. admin"
                            autoComplete="off"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-black"
                            placeholder="••••••••"
                        />
                    </div>

                    {/* Bloque de renderizado condicional para manejo de errores */}
                    {error && (
                        <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                    >
                        {isLoading ? 'Verificando...' : 'Iniciar Sesión'}
                    </button>
                </form>
            </div>
        </main>
    );
}