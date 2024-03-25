FROM ubuntu:latest


WORKDIR /app

COPY . /app

RUN apt update && apt install ffmpeg -y

RUN apt install python3 -y 

RUN apt install python3-pip -y

RUN pip install -U openai-whisper

RUN pip install setuptools-rust

RUN pip install confluent_kafka

CMD [ "python3", "main.py"]