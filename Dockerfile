# Etapa 1 — Build
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2 — Nginx
FROM nginx:stable-alpine

RUN rm -rf /usr/share/nginx/html/*

# Aqui a correção: trocar dist -> build
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
