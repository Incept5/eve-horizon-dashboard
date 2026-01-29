# Build stage for client
FROM node:20-alpine AS client-builder

WORKDIR /app/client

# Copy client package files
COPY client/package.json client/package-lock.json* ./

# Install client dependencies
RUN npm install

# Copy client source
COPY client/ ./

# Build the client
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy server files
COPY package.json index.js ./

# Copy built client from builder stage
COPY --from=client-builder /app/client/dist ./dist

EXPOSE 3000

CMD ["node", "index.js"]
