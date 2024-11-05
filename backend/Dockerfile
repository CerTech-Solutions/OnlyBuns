FROM node:18.10-alpine3.15

WORKDIR /usr/backend

COPY . .

RUN npm install

EXPOSE ${PORT}

CMD npm run db-all && npm run start