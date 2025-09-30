FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm ci --only=production
RUN cd client && npm ci --only=production

# Copy source code
COPY . .

# Build React app
RUN cd client && npm run build

# Create necessary directories
RUN mkdir -p uploads logs data

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S service -u 1001
RUN chown -R service:nodejs /usr/src/app

USER service

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node health-check.js

# Start the application
CMD ["npm", "run", "start:production"]