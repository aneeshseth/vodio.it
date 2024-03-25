import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function Component() {
  return (
    <div className="bg-[#121212] text-white p-8 h-full overflow-auto">
      <h1 className="text-4xl font-bold mb-4">
        The <span className="text-blue-500">vodio.it</span> design
        implementation.
      </h1>
      <div className="flex justify-center mt-10 mb-5">
        <img
          src="https://res.cloudinary.com/dysiv1c2j/image/upload/v1711254672/Screen_Shot_2024-03-23_at_9.30.03_PM_wkiovx.png"
          className="rounded-md h-[200px] lg:h-[500px]"
        />
      </div>
      <hr className="border-gray-700 mb-6" />
      <h1 className="text-2xl font-bold mb-4">Tech Stack:</h1>
      <p className="mb-5">
        Docker, AWS, Golang, Python, Typescript, Javascript, Next.js 13,
        Tailwind CSS, ShadCN/ui
      </p>
      <h1 className="text-2xl font-bold mb-4">Problem Statement:</h1>
      <p className="mb-3 text-md">
        The problem statement is simple. I want to be able to transcode videos
        into different video qualities (1080p, 720p, 360p) etc, and also
        generate logs for them in real-time which can be displayed to the user.
      </p>
      <div className="flex justify-center mt-10 flex-col mb-10">
        <img
          src="https://res.cloudinary.com/dysiv1c2j/image/upload/v1711236853/Screen_Shot_2024-03-23_at_4.32.58_PM_i2i7ys.png"
          className="rounded-xl h-[200px] lg:h-[800px]"
        />
      </div>
      <p className="mb-6 text-lg">
        The application is built with 3 primary services: a golang service which
        handles requests to transcode/transcribe a video, a javascript service
        which runs on an ECS container triggered by the golang service to
        transcode videos, and a python service to use whisper ai to transcribe
        videos.
      </p>
      <p className="mb-6 text-lg">
        <b>The Golang microservice</b>:
      </p>
      <p className="mb-6 text-md">
        This service is primarily responsible to run a predefined AWS ECS task
        on AWS. The task internally runs a Docker image which downloads the
        necessary dependencies, and enters a Javascript file which transcodes
        the video, and uploads the video to the designated bucket. For
        transcribing, the service runs a predefined AWS ECS task on AWS which
        this time enters a python file, which transcribes the video using
        whisper ai.
      </p>
      <p className="mb-3 text-xl">
        <b>Real Time logs:</b>
      </p>
      <p className="mb-3 text-md">
        A very important part of this application is the generation of logs in
        real time when the video is transcoding. For this, Apache Kafka to
        stream data from the javascript service running inside an ECS task to
        the golang service. The Golang service that recieves the data from
        Kafka, and via a WebSocket connection created, is sent back to the
        designated client through some in-program logic.
      </p>
      <div className="mt-10 flex justify-center">
        <img
          src="https://res.cloudinary.com/dysiv1c2j/image/upload/v1711275798/Screen_Shot_2024-03-24_at_3.23.00_AM_fiaqpt.png"
          className=" rounded-xl"
        />
      </div>
      <div className="flex justify-center mt-10 mb-5">
        <img
          src="https://res.cloudinary.com/dysiv1c2j/image/upload/v1711254672/Screen_Shot_2024-03-23_at_9.30.03_PM_wkiovx.png"
          className="rounded-md h-[200px] lg:h-[500px]"
        />
      </div>
    </div>
  );
}

function CloudLightningIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973" />
      <path d="m13 12-3 5h4l-3 5" />
    </svg>
  );
}

function FilterIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function ListOrderedIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="10" x2="21" y1="6" y2="6" />
      <line x1="10" x2="21" y1="12" y2="12" />
      <line x1="10" x2="21" y1="18" y2="18" />
      <path d="M4 6h1v4" />
      <path d="M4 10h2" />
      <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
    </svg>
  );
}
