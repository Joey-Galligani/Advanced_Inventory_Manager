# Build stage
FROM node:latest AS build

# Set working directory
WORKDIR /app

# Copy package files and install dependencies with npm ci
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application to NGINX public directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose NGINX default port
EXPOSE 80

# Run NGINX in the foreground
CMD ["nginx", "-g", "daemon off;"]
