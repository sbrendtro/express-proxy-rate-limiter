# build environment
FROM node:18-alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.json ./
RUN npm ci --silent
COPY src/ ./src
RUN npm run build
COPY config/ ./config

CMD [ "node", "dist/index.js" ]