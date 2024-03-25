"use client";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { helix } from "ldrs";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";

function page() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  helix.register();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const key = searchParams.get("key");
  async function startTranscoding() {
    await axios.post("http://localhost:3005", {
      url: `https://vodio.s3.amazonaws.com/${key}.mp4`,
      email: id,
    });
    alert("finished transcoding!");
  }
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8080/ws?roomID=${id}`);
    ws!.onopen = () => {
      ws!.onmessage = (event) => {
        console.log(event);
      };
    };
  }, []);
  useEffect(() => {
    startTranscoding();
  }, []);
  return (
    <div className="flex w-screen md:flex-row flex-col">
      <div className="md:w-full w-full h-screen mt-10 mr-5 p-3">
        <Card className="w-full h-full border-2 rounded-xl bg-black">
          <CardHeader>
            <CardTitle>
              <Badge variant="destructive" className="text-lg font-normal">
                {loading ? "subtitles generating:" : "subtitles generated:"}
              </Badge>
            </CardTitle>
            <CardDescription className="ml-1 mt-8">
              {loading
                ? ` until then, here's a random joke: what’s the best thing about
              Switzerland? I don’t know, but the flag is a big plus.`
                : ``}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="w-full m-2  p-2 -mt-20 h-screen justify-center flex items-center z-50">
                <l-helix size="150" speed="5" color="blue"></l-helix>
              </div>
            ) : (
              <div className="ml-2 border-2 rounded-xl p-2 w-full">
                I did it because you're a damn man here!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default page;
