# syntax=docker/dockerfile:1.7

# --- Base builder for node modules and builds ---
FROM node:20-alpine AS base
WORKDIR /app
ENV CI=true

# Install OS deps if needed (openssl for prisma-like clients; git for some installs)
RUN apk add --no-cache bash libc6-compat

# Pre-copy package manifests for better layer caching
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Copy source
COPY . .

# Build client and server
RUN npm run build

# --- Runtime image ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup -S nodejs && adduser -S nodeuser -G nodejs

# Copy built artifacts and production deps only
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist

# Expose the single port used by the server
ENV PORT=5000
EXPOSE 5000

# Ensure timezone/logging consistency (optional)
ENV TZ=UTC

USER nodeuser

CMD ["node", "dist/index.js"]


