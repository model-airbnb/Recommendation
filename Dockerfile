FROM node:9.0

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 8080
CMD [ "npm", "start" ]