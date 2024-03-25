FROM ubuntu:20.04


RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs


RUN apt-get install -y ffmpeg

WORKDIR /usr/src/app


COPY package*.json ./


RUN npm install


COPY . .


CMD ["node", "index.js"]
