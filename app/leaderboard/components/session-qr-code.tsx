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
    <div className="hidden lg:flex lg:justify-self-end flex-col items-center gap-1 bg-bone rounded-t-[3rem] xl:rounded-t-[4.5rem] rounded-b-lg border-3 border-mist glow-hex px-3 pb-2 pt-2 xl:pt-3 animate-slide-in">
      <p className="font-spooky text-lg xl:text-3xl tracking-widest text-crypt/70 leading-none">
        R.I.P.
      </p>
      {/* Stays dark on light: phone cameras often fail to read inverted codes */}
      <QRCodeSVG
        value={`${origin}/?session=${sessionId}`}
        title={`Scan to join session ${sessionShortcode}`}
        level="M"
        bgColor="#f5eddc"
        fgColor="#0b0612"
        className="size-28 xl:size-40 2xl:size-44"
      />
      <p className="font-spooky text-base xl:text-2xl leading-tight tracking-wide text-crypt whitespace-nowrap">
        Scan if you dare! 🎃
      </p>
    </div>
  );
}
