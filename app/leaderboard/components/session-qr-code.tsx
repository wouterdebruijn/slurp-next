"use client";

import { useSyncExternalStore } from "react";
import { QRCodeSVG } from "qrcode.react";

const subscribeToOrigin = () => () => {};

interface SessionQrCodeProps {
  sessionId: string;
  sessionShortcode: string;
}

export default function SessionQrCode({
  sessionId,
  sessionShortcode,
}: SessionQrCodeProps) {
  // The origin is only known in the browser, so the code renders after hydration
  const origin = useSyncExternalStore(
    subscribeToOrigin,
    () => window.location.origin,
    () => null,
  );

  if (!origin) {
    return null;
  }

  return (
    <div className="hidden lg:flex lg:justify-self-end flex-col items-center gap-1 xl:gap-2 bg-white rounded-2xl xl:rounded-3xl border-3 border-yellow-300 shadow-lg p-3 animate-slide-in">
      <QRCodeSVG
        value={`${origin}/?session=${sessionId}`}
        title={`Scan to join session ${sessionShortcode}`}
        level="M"
        className="size-28 xl:size-40 2xl:size-48"
      />
      <p className="text-sm xl:text-xl font-bold text-gray-800 whitespace-nowrap">
        Scan to join! 🍻
      </p>
    </div>
  );
}
