# Base image for building the Vite app
FROM node:20.18.0-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (ignoring scripts to avoid sqlite build issues if we don't need it on the frontend)
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the Vite application
RUN npm run build

# Production image
FROM node:20.18.0-alpine

# Set working directory
WORKDIR /app

# Install simple http server for serving static content
RUN npm install -g serve

# Copy the build output from the builder stage
COPY --from=builder /app/dist ./dist

# Expose port 5554
EXPOSE 5554

# Start serve
#CMD ["serve", "-s", "dist", "-l", "8080"]
CMD ["serve", "-s", "dist", "-l", "tcp://0.0.0.0:5554"]
