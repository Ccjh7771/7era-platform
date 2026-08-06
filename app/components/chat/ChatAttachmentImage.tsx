"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function ChatAttachmentImage({ messageId }: { messageId: string }) {
  const [source, setSource] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl = "";

    async function loadImage() {
      try {
        const response = await fetch(`/api/chat-attachments?message=${encodeURIComponent(messageId)}`, {
          cache: "force-cache",
          credentials: "same-origin",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Image unavailable");
        objectUrl = URL.createObjectURL(await response.blob());
        setSource(objectUrl);
      } catch {
        if (!controller.signal.aborted) setFailed(true);
      }
    }

    void loadImage();
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [messageId]);

  if (failed) {
    return <div className="flex h-32 min-w-48 items-center justify-center rounded-xl bg-black/20 px-4 text-xs text-current/60">Photo unavailable</div>;
  }

  if (!source) {
    return <div className="h-32 min-w-48 animate-pulse rounded-xl bg-white/10" aria-label="Loading photo" />;
  }

  return (
    <a href={source} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl" aria-label="Open photo">
      <Image
        src={source}
        alt="Chat attachment"
        width={640}
        height={480}
        unoptimized
        className="max-h-80 w-auto max-w-full object-contain"
      />
    </a>
  );
}
