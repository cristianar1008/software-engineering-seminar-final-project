# Etapa 1: Build de Angular
FROM node:20-alpine AS build
WORKDIR /app

# Copiamos package.json y package-lock.json primero para aprovechar la caché
COPY package*.json ./
RUN npm install

# Copiamos el resto del proyecto
COPY . .

# Build de producción
RUN npm run build -- --configuration=production

# Etapa 2: Servidor NGINX
FROM nginx:alpine

# Copiamos los archivos compilados de Angular al servidor web
COPY --from=build /app/dist /usr/share/nginx/html

# Copiamos una configuración de NGINX personalizada (la definimos abajo)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
