# Etapa 1: Build de Angular
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build -- --configuration=production

# Etapa 2: Servidor NGINX
FROM nginx:alpine

# Copiamos solo la carpeta generada del build
COPY --from=build /app/dist/secretary-portal /usr/share/nginx/html

# Opcional: configuración custom
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
