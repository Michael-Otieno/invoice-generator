# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install Angular CLI globally
RUN npm install -g @angular/cli

# Install project dependencies
RUN npm install

# Copy the entire project directory to the working directory
COPY . .

# Build the Angular app for production
RUN ng build --prod

# Expose port 80 for the application
EXPOSE 80

# Start the Angular app
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "80"]
