# Dockerfile for ITE Backend
# Use a lightweight, stable Node image
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy only package manifests first (allows layer caching)
COPY package.json ./
# If a lockfile exists, copy it – otherwise npm will generate one during install
COPY package-lock.json ./ || true

# Install production dependencies (no devDependencies)
RUN npm ci --only=production

# Copy the rest of the source code
COPY . ./

# Build stage (optional – if you have a build step, add here)
# RUN npm run build

# Runtime stage – smaller image
FROM node:20-alpine
WORKDIR /app

# Copy node_modules from builder
COPY --from=builder /app/node_modules ./node_modules
# Copy application source
COPY --from=builder /app .

# Expose the port the app runs on (default 3000)
EXPOSE 3000

# Use non‑root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Start the server
CMD ["node", "src/server.js"]
