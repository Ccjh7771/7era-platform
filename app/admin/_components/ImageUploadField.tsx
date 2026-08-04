"use client";

import Image from "next/image";
import { ChangeEvent, useEffect, useRef, useState } from "react";

export function ImageUploadField({ id, label, currentUrl }: { id: string; label: string; currentUrl?: string | null }) {
  const [preview, setPreview] = useState(currentUrl ?? "");
  const objectUrl = useRef<string | null>(null);
  useEffect(() => () => { if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); }, []);
  function onChange(event: ChangeEvent<HTMLInputElement>) {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    const file = event.target.files?.[0];
    if (!file) { setPreview(currentUrl ?? ""); return; }
    objectUrl.current = URL.createObjectURL(file); setPreview(objectUrl.current);
  }
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-zinc-200">{label}</label>
      <div className="mt-3 flex flex-wrap items-center gap-4 rounded-2xl border border-dashed border-white/15 bg-black/30 p-4">
        <div className="relative h-24 w-32 overflow-hidden rounded-xl border border-white/10 bg-black/50">
          {preview ? <Image src={preview} alt={`${label} preview`} fill sizes="128px" unoptimized={preview.startsWith("blob:")} className="object-contain" /> : <span className="flex h-full items-center justify-center text-xs text-zinc-600">No image</span>}
        </div>
        <input id={id} name="imageFile" type="file" accept="image/png,image/jpeg,image/webp" onChange={onChange} className="max-w-full text-sm text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-yellow-400 file:px-3 file:py-2 file:font-bold file:text-black" />
      </div>
      <p className="mt-2 text-xs text-zinc-600">PNG, JPG or WebP up to 3MB.</p>
    </div>
  );
}
