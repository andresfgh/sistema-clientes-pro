import { SignJWT, jwtVerify } from 'jose';

// Se codifica la clave secreta en un formato compatible con la especificacion Web Crypto API
const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);

// Generacion del token de acceso con expiracion predeterminada de 8 horas
export async function signToken(payload: { userId: string; username: string }) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('8h')
        .sign(secretKey);
}

// Verificacion y decodificacion asincrona del token
export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, secretKey);
        return payload;
    } catch (error) {
        console.error('[JWT_VERIFICATION_ERROR]', error);
        return null;
    }
}