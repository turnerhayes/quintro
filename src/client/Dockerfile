FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY react-router.config.ts ./
COPY src ./src

EXPOSE 5173

ENV NODE_ENV=development

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
