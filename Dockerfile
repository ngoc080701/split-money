# Using multi-stage build to reduce image size

# Stage 1: Build the application
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Create the production image
FROM node:20-alpine AS production

WORKDIR /app

COPY --from=build /app/dist ./dist

COPY --from=build /app/package*.json ./

RUN npm install --only=production

EXPOSE 3000

CMD ["node", "dist/main.js"]
