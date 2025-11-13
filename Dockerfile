FROM node:20-bullseye

WORKDIR /app

# Copy package files trước để tối ưu cache
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy toàn bộ source code
COPY . .

EXPOSE 1337

CMD ["npm", "run", "develop"]
