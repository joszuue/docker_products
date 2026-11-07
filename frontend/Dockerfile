# ========================================================
# Etapa 1: Dependencias (Instalación reproducible con npm ci)
# ========================================================
FROM node:20.18-alpine AS deps

WORKDIR /app

# Instalar libc6-compat si es necesario para compatibilidad con ciertas bibliotecas nativas
RUN apk add --no-cache libc6-compat

# Copiar manifiestos y lockfile para aprovechar el sistema de caché de capas
COPY package.json package-lock.json ./

# Instalación exacta y reproducible de dependencias
RUN npm ci

# ========================================================
# Etapa 2: Construcción (next build)
# ========================================================
FROM node:20.18-alpine AS builder

WORKDIR /app

# Copiar módulos de nodo desde la etapa de dependencias
COPY --from=deps /app/node_modules ./node_modules
COPY . ./

# Variables de compilación para Next.js (embebidas en tiempo de build)
ARG NEXT_PUBLIC_API_URL=http://localhost:8000/api
ARG NEXT_PUBLIC_STORAGE_URL=http://localhost:8000/storage

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_STORAGE_URL=$NEXT_PUBLIC_STORAGE_URL
ENV NODE_ENV=production

# Ejecutar compilación de producción de Next.js
RUN npm run build

# Eliminar dependencias de desarrollo conservando únicamente las de producción
RUN npm prune --production

# ========================================================
# Etapa 3: Entorno de ejecución (Runtime con next start)
# ========================================================
FROM node:20.18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Instalar curl para healthcheck
RUN apk add --no-cache curl

# Usar el usuario sin privilegios 'node' incluido por defecto en node:alpine
# Asignar permisos al directorio de la aplicación
RUN chown -R node:node /app

# Copiar artefactos de compilación y dependencias de producción
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next ./.next

# Eliminar la caché de construcción de .next para minimizar el tamaño de la imagen final
RUN rm -rf /app/.next/cache

# Cambiar a usuario no privilegiado
USER node

# Exponer el puerto 3000 en 0.0.0.0
EXPOSE 3000

# Healthcheck interno para verificar disponibilidad del frontend
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://127.0.0.1:3000/ || exit 1

# Ejecutar mediante next start en 0.0.0.0:3000 cumpliendo el requisito estricto
CMD ["./node_modules/.bin/next", "start", "-p", "3000", "-H", "0.0.0.0"]
