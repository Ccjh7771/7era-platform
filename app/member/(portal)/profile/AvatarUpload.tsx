"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import { removeMemberAvatar, saveMemberAvatar } from "./actions";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maximumSize = 2 * 1024 * 1024;

export function AvatarUpload({ memberId, hasAvatar }: { memberId: string; hasAvatar: boolean }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  async function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || busy) return;

    if (!allowedTypes.has(file.type) || file.size > maximumSize) {
      setIsError(true);
      setMessage("Choose a JPG, PNG or WebP image up to 2MB.");
      return;
    }

    setBusy(true);
    setMessage("");
    setIsError(false);

    const { error: uploadError } = await supabase.storage
      .from("member-avatars")
      .upload(`${memberId}/avatar`, file, {
        upsert: true,
        contentType: file.type,
        cacheControl: "3600",
      });

    if (uploadError) {
      setBusy(false);
      setIsError(true);
      setMessage("Unable to upload the profile photo.");
      return;
    }

    const result = await saveMemberAvatar();
    setBusy(false);
    setIsError(!result.ok);
    setMessage(result.message);
    if (result.ok) router.refresh();
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
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadAvatar} disabled={busy} className="sr-only" />
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
