FROM node:20-alpine

WORKDIR /app

# Install dependencies first (for faster caching)
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Expose the port Next.js runs on
EXPOSE 3000

# Run in development mode
CMD ["npm", "run dev"]