FROM node:18.10-alpine3.15

WORKDIR /usr/backend

COPY package*.json ./

RUN npm install

COPY . .

CMD npm run start