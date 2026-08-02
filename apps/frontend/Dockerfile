# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY apps/frontend/package.json ./
RUN npm install
COPY apps/frontend/ .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
