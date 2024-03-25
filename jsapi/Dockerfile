FROM node:16


WORKDIR /usr/src/app


COPY package*.json ./


RUN npm install


RUN npm install -g ffmpeg


RUN npm install node-rdkafka

COPY . .


CMD ["node", "index.js"]
