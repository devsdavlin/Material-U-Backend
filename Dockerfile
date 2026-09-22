# Receta para encender el backend en Coolify (o cualquier servidor con Docker).
# No lleva claves: las variables llegan por el panel de Coolify al arrancar.

# ---------- Etapa 1: armar el programa ----------
FROM node:20-alpine AS builder

# Prisma necesita estas librerías en Alpine
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts ./
COPY tsconfig.json ./
COPY src ./src

# Prisma generate pide que exista DATABASE_URL aunque sea falsa.
# Solo es para armar el cliente; la real se pone al arrancar.
ARG DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy?sslmode=disable
ENV DATABASE_URL=$DATABASE_URL

RUN npm run db:generate
RUN npm run build

# ---------- Etapa 2: imagen chiquita solo para correr ----------
FROM node:20-alpine AS runner

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Prisma CLI se necesita al arrancar para aplicar las migraciones
RUN npm install --no-save prisma@7.10.0

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/src/generated ./src/generated

EXPOSE 3000

# Al prender: primero deja las tablas al día, luego arranca el servidor
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
