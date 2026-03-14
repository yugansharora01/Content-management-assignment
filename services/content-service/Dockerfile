# ---------- Build Stage ----------
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json .npmrc ./

# Install dependencies with clean install
RUN npm ci

# Copy source code
COPY . .

# Build application (if using TypeScript / build step)
RUN npm run build


# ---------- Production Stage ----------
FROM node:22-alpine AS runner

WORKDIR /app

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# Create non-root user for security
USER node

# Copy dependency manifests
COPY --chown=node:node package*.json .npmrc ./

# Install only production dependencies
RUN npm ci --omit=dev --ignore-scripts

# Copy built application from builder stage
COPY --chown=node:node --from=builder /app/dist ./dist

# Expose service port
EXPOSE 4000

# Health check (very good practice)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget --quiet --tries=1 --spider http://localhost:4000/health || exit 1

# Start application
CMD ["node", "dist/server.js"]