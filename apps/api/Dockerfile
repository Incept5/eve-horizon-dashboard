FROM node:20-alpine

WORKDIR /app

COPY package.json index.js ./
COPY public ./public

EXPOSE 3000

CMD ["node", "index.js"]
