# Use Node.js 22 as base image (latest LTS)
FROM node:22-alpine

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies first (including dev dependencies for build)
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Remove build dependencies to reduce image size
RUN apk del python3 make g++

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port (dynamic based on env)
EXPOSE 3000

# Health check - use the same port as the app
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "const http = require('http'); const port = process.env.PORT || 3000; http.get('http://localhost:' + port + '/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1));" || exit 1

# Start the application
CMD ["npm", "start"]
