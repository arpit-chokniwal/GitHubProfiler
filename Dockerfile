FROM node:18.11.0

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

RUN export NODE_OPTIONS="--max-old-space-size=2048"

EXPOSE 3000

CMD ["npm", "run", "start"]
