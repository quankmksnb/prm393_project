"use client";

import { Toaster } from "react-hot-toast";
import { SocketListener } from "./SocketListener";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Toaster position="top-right" duration={3000} />
      <SocketListener />
      {children}
    </>
  );
}
