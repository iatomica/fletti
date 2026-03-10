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

# Use a lightweight NGINX image to serve the static files
FROM nginx:alpine

# Copy custom nginx config if you have routing requirements (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build output from the builder stage to NGINX
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 8080
EXPOSE 8080

# Update default nginx listening port to 8080
RUN sed -i 's/listen  *80;/listen 8080;/g' /etc/nginx/conf.d/default.conf

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
