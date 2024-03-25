"use client";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { helix } from "ldrs";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

function page() {
  const [logs, setLogs] = useState([]);
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const key = searchParams.get("key");
  const currentRef = React.useRef();
  const [loading, setLoading] = useState(true);
  helix.register();

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8080/ws?roomID=${id}`);
    ws!.onopen = () => {
      ws!.onmessage = (event) => {
        //@ts-ignore
        setLogs((prevLogs) => [...prevLogs, event.data]);
        setLoading(false);
      };
    };
  }, []);

  async function startTranscoding() {
    setTimeout(async () => {
      await axios.post("http://localhost:3005", {
        url: `https://vodio.s3.amazonaws.com/${key}.mp4`,
        email: id,
      });
    }, 5000);
  }
  useEffect(() => {
    startTranscoding();
  }, []);
  useEffect(() => {
    if (currentRef.current) {
      //@ts-ignore
      currentRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);
  return (
    <div className="flex w-screen md:flex-row flex-col">
      {loading ? (
        <div className="absolute top-14 right-6 md:right-10">
          <l-helix size="40" speed="5" color="blue"></l-helix>
        </div>
      ) : (
        <div />
      )}
      <div className="md:w-full h-screen w-full mt-10 md:ml-5 mr-5 p-3 flex">
        <Card className="w-full h-full  bg-black">
          <CardHeader>
            <CardTitle className="mb-2">
              <Badge variant="destructive" className="text-lg font-normal">
                transcoding logs:
              </Badge>
            </CardTitle>
            <CardDescription className="">
              please <span className="text-red-500">dont refresh</span> the
              page, or transcoding will restart. if you see the `Qavg` log, you
              can then access your transcoded videos at
              https://vodio.s3.amazonaws.com/
              {key}-<span className="text-green-500">(quality)</span>.mp4
              (qualities = <code> 1080 || 720 || 480 || 360</code>)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-full p-5 overflow-auto rounded-xl bg-zinc-900 max-h-[500px]">
              <div className="mb-5">
                <l-helix size="40" speed="5" color="blue"></l-helix>
              </div>
              {logs.map((log, index) => (
                //@ts-ignore
                <div
                  className="mt-2 text-slate-400"
                  // @ts-ignore
                  ref={index === logs.length - 1 ? currentRef : null}
                >
                  <span className="text-blue-500">
                    {new Date().toLocaleTimeString()} :::
                  </span>{" "}
                  {log}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default page;
