FROM node:20-slim

# Install Python for local code execution
RUN apt-get update && \
    apt-get install -y python3 && \
    ln -sf /usr/bin/python3 /usr/bin/python && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 4000
CMD ["node", "index.js"]
