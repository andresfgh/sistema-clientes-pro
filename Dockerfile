# Capa 1: Construccion (Builder)
FROM node:20-alpine AS builder
# Dependencias de SO para el motor de Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copiamos manifiestos y dependencias de base de datos
COPY package*.json ./
COPY prisma ./prisma/

# Instalacion limpia de dependencias
RUN npm ci

# Copiamos el resto del codigo fuente
COPY . .

# Generamos el cliente de Prisma y compilamos Next.js
RUN npx prisma generate
RUN npm run build

# Capa 2: Produccion (Runner)
FROM node:20-alpine AS runner
# Parche de infraestructura: Dependencias de SO en el contenedor final
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Establecemos entorno de produccion
ENV NODE_ENV=production

# Copiamos solo los artefactos necesarios desde la capa de construccion
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Exponemos el puerto estandar de Next.js
EXPOSE 3000

# Comando de arranque en produccion
CMD ["npm", "start"]