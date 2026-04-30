import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

// Interceptor global para proteger rutas privadas
export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Se definen las rutas que requieren autorizacion estricta
    const isApiRoute = path.startsWith('/api/clientes');
    const isDashboardRoute = path.startsWith('/dashboard');

    if (isApiRoute || isDashboardRoute) {
        const token = request.cookies.get('auth_token')?.value;

        // Rechazo inmediato si no hay presencia de credenciales
        if (!token) {
            return path.startsWith('/api') 
                ? NextResponse.json({ error: 'No autorizado' }, { status: 401 })
                : NextResponse.redirect(new URL('/login', request.url));
        }

        // Verificacion criptografica de la firma del token
        const payload = await verifyToken(token);
        
        if (!payload) {
            // Eliminacion de token corrupto o expirado
            const response = path.startsWith('/api')
                ? NextResponse.json({ error: 'Sesion expirada o invalida' }, { status: 401 })
                : NextResponse.redirect(new URL('/login', request.url));
            
            response.cookies.delete('auth_token');
            return response;
        }
        
        // Permite la continuacion del flujo si el token es valido
        return NextResponse.next();
    }

    return NextResponse.next();
}

// Optimizacion del middleware para que solo se ejecute en rutas especificas
export const config = {
    matcher: ['/api/clientes/:path*', '/dashboard/:path*'],
};