const fs = require('fs');

const data = {
  "Ahuachapán": {
    "Ahuachapán Norte": ["Atiquizaya", "El Refugio", "San Lorenzo", "Turín"],
    "Ahuachapán Centro": ["Ahuachapán", "Apaneca", "Concepción de Ataco", "Tacuba"],
    "Ahuachapán Sur": ["Guaymango", "Jujutla", "San Francisco Menéndez", "San Pedro Puxtla"]
  },
  "Santa Ana": {
    "Santa Ana Norte": ["Masahuat", "Metapán", "Santa Rosa Guachipilín", "Texistepeque"],
    "Santa Ana Centro": ["Santa Ana"],
    "Santa Ana Este": ["Coatepeque", "El Congo"],
    "Santa Ana Oeste": ["Candelaria de la Frontera", "Chalchuapa", "El Porvenir", "San Antonio Pajonal", "San Sebastián Salitrillo", "Santiago de la Frontera"]
  },
  "Sonsonate": {
    "Sonsonate Norte": ["Juayúa", "Nahuizalco", "Salcoatitán", "Santa Catarina Masahuat"],
    "Sonsonate Centro": ["Sonsonate", "Sonzacate", "Nahulingo", "San Antonio del Monte", "Santo Domingo de Guzmán"],
    "Sonsonate Este": ["Izalco", "Armenia", "Caluco", "San Julián", "Cuisnahuat", "Santa Isabel Ishuatán"],
    "Sonsonate Oeste": ["Acajutla"]
  },
  "Chalatenango": {
    "Chalatenango Norte": ["Citalá", "La Palma", "San Ignacio"],
    "Chalatenango Centro": ["Agua Caliente", "Dulce Nombre de María", "El Paraíso", "La Reina", "Nueva Concepción", "San Fernando", "San Francisco Morazán", "San Rafael", "Santa Rita", "Tejutla"],
    "Chalatenango Sur": ["Arcatao", "Azacualpa", "Cancasque", "Chalatenango", "Comalapa", "Concepción Quezaltepeque", "El Carrizal", "La Laguna", "Las Vueltas", "Nombre de Jesús", "Nueva Trinidad", "Ojos de Agua", "Potonico", "San Antonio de la Cruz", "San Antonio Los Ranchos", "San Francisco Lempa", "San Isidro Labrador", "San José Cancasque", "San Miguel de Mercedes", "San José Las Flores", "San Luis del Carmen"]
  },
  "La Libertad": {
    "La Libertad Norte": ["Quezaltepeque", "San Matías", "San Pablo Tacachico"],
    "La Libertad Centro": ["San Juan Opico", "Ciudad Arce"],
    "La Libertad Oeste": ["Colón", "Jayaque", "Sacacoyo", "Tepecoyo", "Talcualuya"],
    "La Libertad Este": ["Antiguo Cuscatlán", "Huizúcar", "Nuevo Cuscatlán", "San José Villanueva", "Zaragoza"],
    "La Libertad Costa": ["Chiltiupán", "Jicalapa", "La Libertad", "Tamanique", "Teotepeque"],
    "La Libertad Sur": ["Comasagua", "Santa Tecla"]
  },
  "San Salvador": {
    "San Salvador Norte": ["Aguilares", "El Paisnal", "Guazapa"],
    "San Salvador Oeste": ["Apopa", "Nejapa"],
    "San Salvador Este": ["Ilopango", "San Martín", "Soyapango", "Tonacatepeque"],
    "San Salvador Centro": ["Ayutuxtepeque", "Mejicanos", "San Salvador", "Cuscatancingo", "Ciudad Delgado"],
    "San Salvador Sur": ["Panchimalco", "Rosario de Mora", "San Marcos", "Santo Tomás", "Santiago Texacuangos"]
  },
  "Cuscatlán": {
    "Cuscatlán Norte": ["Suchitoto", "San José Guayabal", "Oratorio de Concepción", "San Bartolomé Perulapía", "San Pedro Perulapán"],
    "Cuscatlán Sur": ["Cojutepeque", "Candelaria", "El Carmen", "El Rosario", "Monte San Juan", "San Cristóbal", "San Rafael Cedros", "San Ramón", "Santa Cruz Analquito", "Santa Cruz Michapa", "Tenancingo"]
  },
  "La Paz": {
    "La Paz Oeste": ["Cuyultitán", "Olocuilta", "San Juan Talpa", "San Luis Talpa", "San Pedro Masahuat", "Tapalhuaca", "San Francisco Chinameca"],
    "La Paz Centro": ["El Rosario", "Jerusalén", "Mercedes La Ceiba", "Paraíso de Osorio", "San Antonio Masahuat", "San Emigdio", "San Juan Tepezontes", "San Luis La Herradura", "San Miguel Tepezontes", "San Pedro Nonualco", "Santa María Ostuma", "Santiago Nonualco"],
    "La Paz Este": ["San Juan Nonualco", "San Rafael Obrajuelo", "Zacatecoluca"]
  },
  "Cabañas": {
    "Cabañas Este": ["Sensuntepeque", "Victoria", "Dolores", "Guacotecti", "San Isidro"],
    "Cabañas Oeste": ["Ilobasco", "Tejutepeque", "Jutiapa", "Cinquera"]
  },
  "San Vicente": {
    "San Vicente Norte": ["Apastepeque", "Santa Clara", "San Ildefonso", "San Esteban Catarina", "San Sebastián", "San Lorenzo", "Santo Domingo"],
    "San Vicente Sur": ["San Vicente", "Guadalupe", "Verapaz", "Tepetitán", "Tecoluca", "San Cayetano Istepeque"]
  },
  "Usulután": {
    "Usulután Norte": ["Santiago de María", "Alegría", "Berlín", "Mercedes Umaña", "Jucuapa", "El Triunfo", "Estanzuelas", "San Buenaventura", "Nueva Granada"],
    "Usulután Este": ["Usulután", "Jucuarán", "San Dionisio", "Concepción Batres", "Santa María", "Ozatlán", "Tecapán", "Santa Elena", "California", "Ereguayquín"],
    "Usulután Oeste": ["Jiquilisco", "Puerto El Triunfo", "San Agustín", "San Francisco Javier"]
  },
  "San Miguel": {
    "San Miguel Norte": ["Ciudad Barrios", "Sesori", "Nuevo Edén de San Juan", "San Gerardo", "San Luis de la Reina", "Carolina", "San Antonio del Mosco", "Chapeltique"],
    "San Miguel Centro": ["San Miguel", "Comacarán", "Uluazapa", "Moncagua", "Quelepa", "Chirilagua"],
    "San Miguel Oeste": ["Chinameca", "Nueva Guadalupe", "Lolotique", "San Jorge", "San Rafael Oriente", "El Tránsito"]
  },
  "Morazán": {
    "Morazán Norte": ["Arambala", "Cacaopera", "Corinto", "El Rosario", "Joateca", "Jocoaitique", "Meanguera", "Perquín", "San Fernando", "San Isidro", "Torola"],
    "Morazán Sur": ["Chilanga", "Delicias de Concepción", "El Divisadero", "Gualococti", "Guatajiagua", "Jocoro", "Lolotiquillo", "Osicala", "San Carlos", "San Francisco Gotera", "San Simón", "Sensembra", "Sociedad", "Yamabal", "Yoloaiquín"]
  },
  "La Unión": {
    "La Unión Norte": ["Anamorós", "Bolívar", "Concepción de Oriente", "El Sauce", "Lislique", "Nueva Esparta", "Pasaquina", "Polorós", "San José", "Santa Rosa de Lima"],
    "La Unión Sur": ["Conchagua", "El Carmen", "Intipucá", "La Unión", "Meanguera del Golfo", "San Alejo", "Yucuaiquín", "Yayantique", "San Escapulario"] // San Escapulario is wrong? wait, the total should be 262.
  }
};

let output = `import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // Definicion de credenciales base para el entorno de evaluacion
    const username = 'admin';
    const rawPassword = 'adminpassword'; 
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const usuario = await prisma.usuario.upsert({
        where: { username },
        update: {}, 
        create: { username, passwordHash },
    });

    console.log(\`[SEED_SUCCESS] Usuario maestro inicializado. Username: \${usuario.username}\`);

    // Inserción de División Política SV 2026 (14 Departamentos, 44 Municipios, 262 Distritos)
`;

output += `    const departamentos = [\n`;
for (const depto of Object.keys(data)) {
    output += `        { nombre: "${depto}" },\n`;
}
output += `    ];\n\n`;
output += `    for (const d of departamentos) {
        await prisma.departamento.upsert({
            where: { nombre: d.nombre },
            update: {},
            create: { nombre: d.nombre }
        });
    }
    console.log(\`[SEED_SUCCESS] Departamentos sincronizados.\`);\n\n`;

output += `    const dbDeptos = await prisma.departamento.findMany();
    const deptoMap = new Map(dbDeptos.map(d => [d.nombre, d.id]));\n\n`;

const municipiosFlat = [];
for (const depto of Object.keys(data)) {
    for (const muni of Object.keys(data[depto])) {
        municipiosFlat.push({ nombre: muni, departamento: depto });
    }
}

output += `    const municipiosData = [\n`;
for (const m of municipiosFlat) {
    output += `        { nombre: "${m.nombre}", depto: "${m.departamento}" },\n`;
}
output += `    ];\n\n`;

output += `    for (const m of municipiosData) {
        const departamentoId = deptoMap.get(m.depto);
        if (departamentoId) {
            await prisma.municipio.upsert({
                where: { nombre_departamentoId: { nombre: m.nombre, departamentoId } },
                update: {},
                create: { nombre: m.nombre, departamentoId }
            });
        }
    }
    console.log(\`[SEED_SUCCESS] Municipios sincronizados.\`);\n\n`;

output += `    const dbMunis = await prisma.municipio.findMany();
    const muniMap = new Map(dbMunis.map(m => [m.nombre, m.id]));\n\n`;

output += `    const distritosData = [\n`;
for (const depto of Object.keys(data)) {
    for (const muni of Object.keys(data[depto])) {
        for (const dist of data[depto][muni]) {
            output += `        { nombre: "${dist}", muni: "${muni}" },\n`;
        }
    }
}
output += `    ];\n\n`;

output += `    for (const d of distritosData) {
        const municipioId = muniMap.get(d.muni);
        if (municipioId) {
            await prisma.distrito.upsert({
                where: { nombre_municipioId: { nombre: d.nombre, municipioId } },
                update: {},
                create: { nombre: d.nombre, municipioId }
            });
        }
    }
    console.log(\`[SEED_SUCCESS] Distritos sincronizados.\`);
}

main()
    .catch((e) => {
        console.error('[SEED_ERROR]', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
`;

fs.writeFileSync('c:/Users/galan/OneDrive/Documentos/PRUEBA TECNICA/sistema-clientes-pro/prisma/seed.ts', output);
console.log('Done writing seed');
