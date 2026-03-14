# ---------- Base Image ----------
FROM node:22-alpine

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy source code
COPY . .

ENV NODE_ENV=production

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
 CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

# Start service
CMD ["node", "src/server.js"]
