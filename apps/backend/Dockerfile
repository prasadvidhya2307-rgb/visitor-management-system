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

ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
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
COPY --from=builder /app/package*.json ./


COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/prisma.config.ts ./

EXPOSE 5000

CMD ["npm", "start"]