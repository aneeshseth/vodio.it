"use client";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import AWS from "aws-sdk";

import { useRouter } from "next/navigation";
function page() {
  function generateRandomString(length) {
    var result = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  const [email, setEmail] = useState<string>(generateRandomString(8));
  const [file, setFile] = useState<File | undefined>();

  AWS.config.update({
    region: "us-east-1",
    accessKeyId: process.env.NEXT_PUBLIC_ACCESS_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_SECRET_KEY!,
  });

  const s3 = new AWS.S3({
    apiVersion: "2006-03-01",
    params: { Bucket: "vodio" },
  });
  const router = useRouter();
  async function uploadFile(keyToSend: string, type: string) {
    //if (file?.type != "video/mp4") return;
    const params = {
      Key: `${keyToSend}.mp4`,
      Body: file,
      Bucket: "vodio",
    };
    await s3.upload(params, (err: any, data: any) => {
      if (err) {
        console.error("Error uploading file:", err);
      } else {
        console.log("File uploaded successfully:", data.Location);
        if (type == "transcode") {
          router.push(`/transcode?key=${keyToSend}&id=${email}`);
        } else if (type == "subtitle") {
          router.push(`/subtitles?key=${keyToSend}&id=${email}`);
        }
      }
    });
  }

  async function startTranscoding() {
    if (email === "" || !/^[a-zA-Z]+$/.test(email)) {
      alert("please enter only letters with no spaces.");
    }
    const keyToSend = uuidv4();
    await uploadFile(keyToSend.toString(), "transcode");
  }
  async function startSubtitles() {
    if (email == "") return;
    const keyToSend = uuidv4();
    await uploadFile(keyToSend.toString(), "subtitle");
  }
  return (
    <div className="">
      <div className="h-screen w-full mt-10 md:ml-5 mr-5 flex justify-center items-center">
        <Card className="border-2 rounded-xl bg-black m-3 -mt-10">
          <CardHeader>
            <CardTitle className="mb-2">start generation:</CardTitle>
            <CardDescription className="">
              please enter a random string for yourself and select a video from
              below to transcode.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex">
              <Input className="max-w-80 mb-5 mr-5" value={email} />
              <Input
                type="file"
                className="mb-5"
                onChange={(e) => setFile(e.target.files?.[0])}
              />
            </div>
            <Button
              variant={"outline"}
              className="mr-5"
              onClick={startTranscoding}
            >
              transcode
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default page;
