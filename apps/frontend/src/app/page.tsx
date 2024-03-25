"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [wsocket, setWS] = useState<WebSocket | null>(null);
  const router = useRouter();
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 600);
  }, []);
  return (
    <div className="h-screen w-full dark:bg-black bg-black dark:bg-dot-black/[0.2] bg-dot-white/[0.2] relative flex items-center justify-center">
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-black[mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="antialiased">
        <div className="absolute top-6 left-6 flex items-center">
          <div>
            <img
              src="https://images.creativefabrica.com/products/thumbnails/2023/10/02/W250ULxXK/2WCzsEQAfHvSEGnOE8c4qIySZ41.png"
              className="w-18 h-16 lg:w-18 lg:h-18 rounded-full"
            />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl ml-5">
            vodio.it
          </h1>
        </div>
        <div className="absolute top-6 right-6 flex items-center">
          <div>
            <Button
              variant={"outline"}
              className="text-md lg:text-xl px-5 mt-3"
              onClick={() => {
                router.push("/docs");
              }}
            >
              docs
            </Button>
          </div>
        </div>
        <div className="mt-20"></div>
        <div className="w-screen h-screen flex flex-col">
          <div className="w-screen flex justify-center items-center flex-col">
            <h1 className="md:text-5xl text-4xl tracking-tight lg:text-5xl  lg:ml-20 ml-10 mr-5 font-bold mt-32 text-center md:text-left">
              <span className="text-red-500">transcode </span>
              videos, with{" "}
              <span className="text-purple-500 inline-block">
                real-time logs.
              </span>
            </h1>
            <h1 className="md:text-lg text-sm tracking-tight lg:text-lg  lg:ml-20 ml-10 mr-5 mt-5 text-center md:text-left font-normal">
              construct used extensively to view videos in 1080p, 720p, etc for
              streaming on{" "}
              <span className="text-red-500">Netflix, Youtube, etc.</span>
            </h1>
            <div className="flex md:mb-12 mb-8">
              <Button
                variant={"outline"}
                className="text-xl px-5 mt-10 mr-5 text-md lg:text-lg"
                onClick={() => {
                  router.push("/docs");
                }}
              >
                how?
              </Button>
              <Button
                variant={"outline"}
                className="text-xl px-5 mt-10 text-md lg:text-lg"
                onClick={() => {
                  router.push("/init");
                }}
              >
                start
              </Button>
            </div>
          </div>
          <div className="text-center flex justify-center items-center  dark:bg-black bg-black dark:bg-dot-black/[0.2] bg-dot-white/[0.2]">
            <div className="flex flex-col">
              <div className="w-full">
                <img
                  src="https://res.cloudinary.com/dysiv1c2j/image/upload/v1711236853/Screen_Shot_2024-03-23_at_4.32.58_PM_i2i7ys.png"
                  className="rounded-xl lg:h-[700px] md:h-[480px] sm:h-[340px] h-[300px] ml-2 mb-10"
                />
              </div>
              <div className="w-full flex justify-center">
                <img
                  src="https://res.cloudinary.com/dysiv1c2j/image/upload/v1710749304/Screen_Shot_2024-03-18_at_1.08.11_AM_mcecpy.png"
                  className="rounded-xl lg:h-[850px] md:h-[650px] sm:h-[450px] h-[350px] mb-10"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
