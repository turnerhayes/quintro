FROM node:22-alpine

WORKDIR /app

COPY src/server/package*.json ./src/server/
RUN npm ci --prefix src/server

COPY tsconfig.base.json ./tsconfig.base.json
COPY src ./src

EXPOSE 8070

ENV NODE_ENV=development

CMD ["npm", "run", "--prefix", "src/server", "dev"]
