const { spawn } = require("child_process");
const { Kafka } = require("kafkajs");
const express = require("express");
const AWS = require("aws-sdk");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
dotenv.config();

const kafka = new Kafka({
  clientId: "my-app",
  brokers: ["dory.srvs.cloudkafka.com:9094"],
  ssl: true,
  sasl: {
    mechanism: "scram-sha-256",
    username: "",
    password: "",
  },
});

const producer = kafka.producer();

app.use(express.json());
app.use(cors());

AWS.config.update({
  region: "us-east-1",
  accessKeyId: "",
  secretAccessKey: "",
});

const s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket: "vodio" },
});

const fs = require("fs");

async function uploadToS3(url, resolutions) {
  const uploads = resolutions.map(async (resolution) => {
    const { width, height } = resolution;
    const filePath = `output_${width}x${height}.mp4`;

    fs.readFile(filePath, async (err, fileData) => {
      if (err) {
        return;
      }

      const params = {
        Key: `${url}-${height}.mp4`,
        Body: fileData,
        Bucket: "vodio",
      };

      await s3.upload(params, (err, data) => {
        if (err) {
          return;
        } else {
          console.log("File uploaded successfully:", data.Location);
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
              return;
            }
            console.log("File deleted successfully from local storage.");
          });
        }
      });
    });
  });
  await Promise.all(uploads);
  console.log(`child process exited with code 0`);
}

async function transcodeVideo() {
  const email = process.env.EMAIL;
  const url = process.env.URL;

  const resolutions = [
    { width: 1920, height: 1080 },
    { width: 1280, height: 720 },
    { width: 858, height: 480 },
    { width: 480, height: 360 },
  ];

  let completedProcesses = 0;

  const extractedUUID = url.split(".com/")[1].split(".")[0];
  console.log(extractedUUID);
  for (const resolution of resolutions) {
    const { width, height } = resolution;
    const ffmpegProcess = spawn("ffmpeg", [
      "-i",
      url,
      "-y",
      "-acodec",
      "aac",
      "-vcodec",
      "libx264",
      "-filter:v",
      `scale=w=${width}:h=${height}`,
      "-f",
      "mp4",
      `output_${width}x${height}.mp4`,
    ]);

    ffmpegProcess.stdout.on("data", (data) => {
      const message = data.toString();
      console.log(`${email}::: ${message}`);
      sendMessage(producer, `${email}::: ${message}`);
    });

    ffmpegProcess.stderr.on("data", (data) => {
      const message = data.toString();
      console.error(`${email}::: ${message}`);
      sendMessage(producer, `${email}::: ${message}`);
    });

    ffmpegProcess.on("close", async (code) => {
      completedProcesses++;
      console.log(completedProcesses);
      console.log(completedProcesses == 4);
      if (completedProcesses === 4) {
        await uploadToS3(extractedUUID, resolutions);
      }
    });
  }
}

const sendMessage = async (producer, message) => {
  await producer.send({
    topic: "mpmypepc-default",
    messages: [{ value: message }],
  });
};

const run = async () => {
  await producer.connect();
  transcodeVideo();
};

run().catch(console.error);
