# vodio.it - **transcode videos, with real-time logs.**

<img width="1355" alt="image" src="https://res.cloudinary.com/dysiv1c2j/image/upload/v1711254672/Screen_Shot_2024-03-23_at_9.30.03_PM_wkiovx.png">

# Problem Statement:

The problem statement is simple. I want to be able to transcode videos into different video qualities (1080p, 720p, 360p) etc, and also generate logs for them in real-time which can be displayed to the user.

<img width="1355" alt="image" src="https://res.cloudinary.com/dysiv1c2j/image/upload/v1711236853/Screen_Shot_2024-03-23_at_4.32.58_PM_i2i7ys.png">

The application is built with 3 primary services: a golang service which handles requests to transcode/transcribe a video, a javascript service which runs on an ECS container triggered by the golang service to transcode videos, and a python service to use whisper ai to transcribe videos.

# The Golang microservice:

This service is primarily responsible to run a predefined AWS ECS task on AWS. The task internally runs a Docker image which downloads the necessary dependencies, and enters a Javascript file which transcodes the video, and uploads the video to the designated bucket. For transcribing, the service runs a predefined AWS ECS task on AWS which this time enters a python file, which transcribes the video using whisper ai.

# Real Time logs:

A very important part of this application is the generation of logs in real time when the video is transcoding. For this, Apache Kafka to stream data from the javascript service running inside an ECS task to the golang service. The Golang service that recieves the data from Kafka, and via a WebSocket connection created, is sent back to the designated client through some in-program logic.

<img width="1355" alt="image" src="https://res.cloudinary.com/dysiv1c2j/image/upload/v1711275798/Screen_Shot_2024-03-24_at_3.23.00_AM_fiaqpt.png">
<img width="1355" alt="image" src="https://res.cloudinary.com/dysiv1c2j/image/upload/v1711254672/Screen_Shot_2024-03-23_at_9.30.03_PM_wkiovx.png">

# Tech Stack:

- Docker
- AWS
- Golang
- Python
- Typescript
- Javascript
- Next.js 13
- Tailwind CSS
- ShadCN/ui
