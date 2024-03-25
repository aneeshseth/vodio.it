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
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

export default function page() {
  const [logs, setLogs] = useState([]);
  let queryParams: URLSearchParams;
  if (typeof window !== "undefined") {
    queryParams = new URLSearchParams(useSearchParams().toString());
  }
  const currentRef = React.useRef();
  const [loading, setLoading] = useState(true);
  var key;
  useEffect(() => {
    const id = queryParams.get("id");
    key = queryParams.get("key");
    console.log(id);
    console.log(key);
  }, []);

  async function startTranscoding() {
    const id = queryParams.get("id");
    const key = queryParams.get("key");
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
              page, or transcoding will restart. wait as the aws container
              starts, usually taking about 1 minute. after transcoding, you can
              then access your transcoded videos at
              https://vodio.s3.amazonaws.com/
              {key}-<span className="text-green-500">(quality)</span>.mp4
              (qualities = <code> 1080 || 720 || 480 || 360</code>)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-full p-5 overflow-auto rounded-xl bg-zinc-900 max-h-[500px]">
              <div className="mb-5">
                <div>loading...</div>
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
