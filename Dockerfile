FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    postgresql-client

RUN npm install -g pnpm

COPY package*.json ./
COPY prisma ./prisma/

RUN pnpm install

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["pnpm", "dev"]
