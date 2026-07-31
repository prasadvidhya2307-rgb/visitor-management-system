# =========================
# Builder Stage
# =========================
FROM node:22-alpine AS builder

WORKDIR /app

COPY apps/backend/package*.json ./

RUN npm ci

COPY apps/backend .

COPY .env .

RUN pwd && ls -la
RUN echo "===== .env =====" && cat .env

RUN npm run build

# =========================
# Production Stage
# =========================
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY apps/backend/package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/package*.json ./

EXPOSE 5000

CMD ["npm", "start"]