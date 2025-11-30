# client/Dockerfile

# 1. Use Node.js Base Image
FROM node:20-alpine

# 2. Set working directory
WORKDIR /app

# 3. Copy dependencies
COPY package*.json ./
RUN npm install

# 4. Copy source code
COPY . .

# 5. Expose Vite Port
EXPOSE 5173

# 6. Start Vite Server (Host 0.0.0.0 is needed for Docker networking)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]