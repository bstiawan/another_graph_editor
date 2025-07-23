# Multi-stage build for React/TypeScript application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Set environment variable for base path
ENV VITE_BASE_PATH=/

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create nginx configuration to handle font files properly
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Handle font files with proper MIME types \
    location ~* \.(ttf|otf|woff|woff2)$ { \
        add_header Access-Control-Allow-Origin *; \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    \
    # Handle all other static files \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 