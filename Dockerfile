FROM node:22-alpine

RUN mkdir /app

COPY package*.json ./app/
COPY . ./app/
RUN cd /app && npm install




CMD ["node", "/app/app.js"]