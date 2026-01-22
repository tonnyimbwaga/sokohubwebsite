"use client";

import dynamic from "next/dynamic";
import { Toaster } from "sonner";

const ThirdPartyScripts = dynamic(() => import("./ThirdPartyScripts"), {
  ssr: false,
});

export default function RootLayoutClient() {
  return (
    <>
      <ThirdPartyScripts />
      <Toaster richColors position="bottom-right" />
    </>
  );
}
