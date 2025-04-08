# Use official Node.js image as base
FROM node:latest AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all the project files into the container
COPY . .

# Run the build command to copy files to the dist directory
RUN npm run build

# Use a smaller base image for the final build
FROM node:latest AS production

# Set the working directory inside the container
WORKDIR /app

# Copy the built files from the build stage
COPY --from=build /app/dist ./

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Ensure swagger.js is included
COPY --from=build /app/docs/swagger.js ./docs/swagger.js

# Set the environment variable to run the app in production
ENV NODE_ENV=production

# Command to run the application
CMD ["node", "app.js"]
