# ==============================================================================
# Multi-Stage Production Dockerfile for CareGuide Backend API
# Best Practices: Multi-stage, Non-root User, Signal Handling, Minimal Attack Surface
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Dependencies Cache
# ------------------------------------------------------------------------------
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci || npm install

# ------------------------------------------------------------------------------
# Stage 2: Source Builder
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json tsconfig.json ./
COPY src ./src

# Compile TypeScript into production JavaScript in /app/dist
RUN npm run build

# Prune development dependencies to keep production footprint minimal
RUN npm prune --omit=dev

# ------------------------------------------------------------------------------
# Stage 3: Production Runner
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner
LABEL maintainer="CareGuide Engineering Team"

# Install lightweight init system and curl for healthchecks
RUN apk add --no-cache dumb-init curl

WORKDIR /app

# Set production environment variables
ENV NODE_ENV=production \
    PORT=5000

# Create uploads directory and ensure node user has full ownership
RUN mkdir -p /app/uploads && chown -R node:node /app

# Copy production artifacts from builder
COPY --chown=node:node --from=builder /app/package.json ./package.json
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist

# Switch to non-root user for security hardening
USER node

# Expose API port
EXPOSE 5000

# Health check against dedicated /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Signal forwarding via dumb-init for graceful shutdown
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
