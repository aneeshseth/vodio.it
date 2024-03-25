const { spawn } = require("child_process");
const Kafka = require("node-rdkafka");
const express = require("express");
const AWS = require("aws-sdk");
const cors = require("cors");
const app = express();

const kafkaConf = {
  "group.id": "mpmypepc-default",
  "metadata.broker.list": "dory.srvs.cloudkafka.com:9094",
  "socket.keepalive.enable": true,
  "security.protocol": "SASL_SSL",
  "sasl.mechanisms": "SCRAM-SHA-256",
  "sasl.username": "mpmypepc",
  "sasl.password": "CpU4icFaStnKJgX1uZCAQcgqHeP5g0RH",
  debug: "generic,broker,security",
};

app.use(express.json());
app.use(cors());
const producerStdout = new Kafka.Producer(kafkaConf);
const producerStderr = new Kafka.Producer(kafkaConf);

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

async function uploadToS3(url, resolutions, res) {
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
  res.sendStatus(200);
}

app.post("/", (req, res) => {
  const { email, url } = req.body;
  console.log(email);
  console.log(url);
  const sendMessage = (producer, message) => {
    producer.produce(
      "mpmypepc-default",
      -1,
      Buffer.from(`${email}::: ${message}`)
    );
  };

  const sendLogs = (producer, logs) => {
    if (logs.length > 0) {
      const message = logs.shift();
      sendMessage(producer, message);
    }
  };

  let stdoutLogs = [];
  let stderrLogs = [];

  const sendStdoutLogs = () => {
    sendLogs(producerStdout, stdoutLogs);
    setTimeout(sendStdoutLogs, 1500);
  };

  const sendStderrLogs = () => {
    sendLogs(producerStderr, stderrLogs);
    setTimeout(sendStderrLogs, 1500);
  };

  const resolutions = [
    { width: 1920, height: 1080 },
    { width: 1280, height: 720 },
    { width: 858, height: 480 },
    { width: 480, height: 360 },
  ];

  let completedProcesses = 0;

  const extractedUUID = url.split(".com/")[1].split(".")[0];
  console.log(extractedUUID);
  resolutions.forEach(async (resolution, index) => {
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
      stdoutLogs.push(message);
    });

    ffmpegProcess.stderr.on("data", (data) => {
      const message = data.toString();
      console.error(`${email}::: ${message}`);
      stderrLogs.push(message);
    });

    ffmpegProcess.on("close", async (code) => {
      console.log(`child process exited with code ${code}`);
      completedProcesses++;
      if (completedProcesses === resolutions.length) {
        await uploadToS3(extractedUUID, resolutions, res);
      }
    });
  });

  producerStdout.on("event.error", function (err) {
    console.error(err);
    process.exit(1);
  });

  producerStderr.on("event.error", function (err) {
    console.error(err);
    process.exit(1);
  });

  producerStdout.on("event.log", function (log) {
    console.log(log);
  });

  producerStderr.on("event.log", function (log) {
    console.log(log);
  });

  producerStdout.connect();
  producerStderr.connect();

  sendStdoutLogs();
  sendStderrLogs();
});

app.listen(3005, () => {
  console.log("listening on port 3005.");
});
