FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Set port for Cloud Run
ENV PORT=8080
EXPOSE 8080

# Start application
CMD ["npm", "start"]
