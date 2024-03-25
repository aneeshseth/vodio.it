"use client";
import { Separator } from "@/components/ui/separator";
import { ProfileForm } from "@/app/docs/profile-form";
import "./page.css";
import { useState } from "react";
import Component from "./components/doc1";
import { useRouter } from "next/navigation";

export default function SettingsProfilePage() {
  const [isCreate, setIsCreate] = useState<boolean>(true);
  const [isUpdate, setIsUpdate] = useState<boolean>(false);
  const [isUpload, setIsUpload] = useState<boolean>(false);
  const router = useRouter();
  return (
    <>
      <div className="w-screen h-screen border-2 border-neutral-800 flex rounded-xl p-3">
        <div className="w-12/12 border-neutral-800 rounded-xl border-2 r-div p-2">
          {isCreate && <Component />}
        </div>
      </div>
    </>
  );
}
