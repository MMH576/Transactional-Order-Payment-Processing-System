# Build stage
FROM node:20-alpine AS builder

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including dev deps for build)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Compile seed script separately
RUN npx tsc prisma/seed.ts --outDir dist/prisma --esModuleInterop --resolveJsonModule --skipLibCheck

# Production stage
FROM node:20-alpine

# Install OpenSSL for Prisma runtime
RUN apk add --no-cache openssl

WORKDIR /app

# Copy built artifacts from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

# Expose the port
EXPOSE 3001

# Run migrations, seed database, then start the application
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/prisma/seed.js && node dist/src/main"]
