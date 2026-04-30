import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth/jwt';

// Controlador para la autenticacion de usuarios y emision de credenciales de sesion
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        // Validacion de entrada
        if (!username || !password) {
            return NextResponse.json({ error: 'Credenciales incompletas' }, { status: 400 });
        }

        // Busqueda del usuario en la base de datos
        const usuario = await prisma.usuario.findUnique({
            where: { username }
        });

        if (!usuario) {
            return NextResponse.json({ error: 'Credenciales invalidas' }, { status: 401 });
        }

        // Verificacion criptografica de la contraseña
        const passwordValida = await bcrypt.compare(password, usuario.passwordHash);
        
        if (!passwordValida) {
            return NextResponse.json({ error: 'Credenciales invalidas' }, { status: 401 });
        }

        // Generacion del token de acceso
        const token = await signToken({ userId: usuario.id, username: usuario.username });

        // Configuracion de respuesta con Cookie HttpOnly para prevencion de ataques XSS
        const response = NextResponse.json({ message: 'Autenticacion exitosa' }, { status: 200 });
        
        response.cookies.set({
            name: 'auth_token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 8 // 8 horas
        });

        return response;

    } catch (error) {
        console.error('[AUTH_LOGIN_ERROR]', error);
        return NextResponse.json({ error: 'Fallo interno en el proceso de autenticacion' }, { status: 500 });
    }
}