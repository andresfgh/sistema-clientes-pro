import { prisma } from '@/lib/prisma';
import { ClientePayload } from '@/core/interfaces/cliente';

function editDistance(s1: string, s2: string): number {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
    const costs: number[] = [];
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i === 0) costs[j] = j;
            else {
                if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1.charAt(i - 1) !== s2.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}

function getSimilarity(s1: string, s2: string): number {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    if (longer.length === 0) return 1.0;
    return (longer.length - editDistance(longer, shorter)) / parseFloat(longer.length.toString());
}

export async function applyDataQualityGuard(body: ClientePayload) {
    // Anti-Gibberish
    const hasVowels = /[AEIOU]/i;
    const max4Consonants = /[BCDFGHJKLMNPQRSTVWXYZ]{5,}/i;

    const testGibberish = (str: string) => {
        if (!str) return false;
        if (!hasVowels.test(str)) return true;
        if (max4Consonants.test(str)) return true;
        return false;
    };

    // Normalización Bancaria y Anti-Gibberish
    if (body.nombres) {
        body.nombres = body.nombres.toUpperCase().replace(/\s+/g, ' ').trim();
        if (testGibberish(body.nombres)) throw new Error('GIBBERISH_DETECTED');
    }
    if (body.apellidos) {
        body.apellidos = body.apellidos.toUpperCase().replace(/\s+/g, ' ').trim();
        if (testGibberish(body.apellidos)) throw new Error('GIBBERISH_DETECTED');
    }

    if (body.direcciones && Array.isArray(body.direcciones)) {
        // Precargar distritos para fuzzy matching
        const distritosDb = await prisma.distrito.findMany();

        for (const dir of body.direcciones) {
            if (dir.direccion) {
                dir.direccion = dir.direccion.toUpperCase().replace(/\s+/g, ' ').trim();
                if (testGibberish(dir.direccion)) throw new Error('GIBBERISH_DETECTED');
            }
            if (dir.ciudad) {
                dir.ciudad = dir.ciudad.toUpperCase().replace(/\s+/g, ' ').trim();
                if (testGibberish(dir.ciudad)) throw new Error('GIBBERISH_DETECTED');
            }
            if (dir.referenciaPrimaria) {
                dir.referenciaPrimaria = dir.referenciaPrimaria.toUpperCase().replace(/\s+/g, ' ').trim();
            }
            if (dir.referenciaEspecifica) {
                dir.referenciaEspecifica = dir.referenciaEspecifica.toUpperCase().replace(/\s+/g, ' ').trim();
            }
            if (dir.puntoReferencia) {
                dir.puntoReferencia = dir.puntoReferencia.toUpperCase().replace(/\s+/g, ' ').trim();
            }

            // Fuzzy Matching
            const locationName = dir.ciudad || '';
            if (locationName) {
                let bestMatch = null;
                let highestSimilarity = 0;

                for (const d of distritosDb) {
                    const sim = getSimilarity(locationName, d.nombre);
                    if (sim > highestSimilarity) {
                        highestSimilarity = sim;
                        bestMatch = d;
                    }
                }

                if (highestSimilarity >= 0.7 && bestMatch) {
                    dir.distritoId = bestMatch.id;
                    dir.ciudad = bestMatch.nombre.toUpperCase();
                    dir.es_ubicacion_personalizada = false;
                } else {
                    dir.es_ubicacion_personalizada = true;
                }
            } else {
                dir.es_ubicacion_personalizada = true;
            }
        }
    }
    
    return body;
}
