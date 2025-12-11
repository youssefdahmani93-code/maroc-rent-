# Stage 1: Use a Node.js image to install dependencies and build the app
FROM node:18-alpine AS base

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install

# Copy app source
COPY . .

# The command to start the app
CMD [ "node", "src/server.js" ]
