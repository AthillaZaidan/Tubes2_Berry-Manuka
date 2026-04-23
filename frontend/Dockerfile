# ─── Stage 1: Builder ───────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files dulu (untuk cache layer dependency)
COPY package.json package-lock.json ./
RUN npm ci

# Copy semua source code
COPY . .

# Build environment variable untuk API URL
ARG NEXT_PUBLIC_API_URL=http://localhost:8080
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build Next.js untuk production
RUN npm run build

# ─── Stage 2: Runner ────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy hasil build dari stage builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expose port frontend
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Jalanin Next.js production server
CMD ["node", "server.js"]
