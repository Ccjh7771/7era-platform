"use client";

import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";

import {
  cmsImageAccept,
  cmsImageMaximumBytes,
  detectCmsImageType,
} from "@/lib/cms-image";

import { removeMemberAvatar, uploadMemberAvatar } from "./actions";

export function AvatarUpload({ hasAvatar }: { hasAvatar: boolean }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const router = useRouter();

  async function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || busy) return;

    if (file.size > cmsImageMaximumBytes) {
      setIsError(true);
      setMessage("Choose a profile photo up to 2MB.");
      return;
    }

    try {
      const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
      if (!detectCmsImageType(header)) {
        setIsError(true);
        setMessage("Choose a genuine JPG, PNG or WebP photo.");
        return;
      }
    } catch {
      setIsError(true);
      setMessage("This photo could not be read. Choose another file.");
      return;
    }

    setBusy(true);
    setMessage("");
    setIsError(false);

    const formData = new FormData();
    formData.set("avatarFile", file);

    try {
      const result = await uploadMemberAvatar(formData);
      setBusy(false);
      setIsError(!result.ok);
      setMessage(result.message);
      if (result.ok) router.refresh();
    } catch {
      setBusy(false);
      setIsError(true);
      setMessage("Unable to upload the profile photo. Please try again.");
    }
  }

  async function removeAvatar() {
    if (busy) return;
    setBusy(true);
    setMessage("");
    setIsError(false);
    const result = await removeMemberAvatar();
    setBusy(false);
    setIsError(!result.ok);
    setMessage(result.message);
    if (result.ok) router.refresh();
  }

  return (
    <div className="mt-5">
      <div className="flex flex-wrap justify-center gap-2">
        <label className={`inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-yellow-400 px-5 text-sm font-black text-black ${busy ? "pointer-events-none opacity-60" : ""}`}>
          {busy ? "Updating…" : hasAvatar ? "Change photo" : "Upload photo"}
          <input type="file" accept={cmsImageAccept} onChange={uploadAvatar} disabled={busy} className="sr-only" />
        </label>
        {hasAvatar && (
          <button type="button" onClick={removeAvatar} disabled={busy} className="min-h-11 rounded-xl border border-white/10 px-4 text-sm font-bold text-zinc-300 disabled:opacity-60">
            Remove
          </button>
        )}
      </div>
      <p className="mt-2 text-xs text-zinc-600">JPG, PNG or WebP · Maximum 2MB</p>
      {message && <p role={isError ? "alert" : "status"} className={`mt-3 text-sm ${isError ? "text-red-300" : "text-emerald-300"}`}>{message}</p>}
    </div>
  );
}
