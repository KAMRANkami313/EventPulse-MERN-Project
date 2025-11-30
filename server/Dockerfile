# server/Dockerfile

# 1. Use Node.js Base Image
FROM node:20-alpine

# 2. Set working directory inside the container
WORKDIR /app

# 3. Copy package.json and install dependencies
# Use copy to take advantage of caching (only re-run npm install if package.json changes)
COPY package*.json ./
RUN npm install

# 4. Copy the rest of the code
COPY . .

# 5. Expose Port
EXPOSE 5000

# 6. Start the server
CMD ["npm", "start"]