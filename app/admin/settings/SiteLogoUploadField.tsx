"use client";

import Image from "next/image";
import {
    type ChangeEvent,
    useEffect,
    useRef,
    useState,
} from "react";

type SiteLogoUploadFieldProps = {
    currentLogoUrl: string | null;
};

export function SiteLogoUploadField({
    currentLogoUrl,
}: SiteLogoUploadFieldProps) {
    const [previewUrl, setPreviewUrl] = useState(currentLogoUrl ?? "");
    const objectUrlRef = useRef<string | null>(null);

    useEffect(
        () => () => {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
            }
        },
        [],
    );

    function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
        }

        const file = event.target.files?.[0];

        if (!file) {
            setPreviewUrl(currentLogoUrl ?? "");
            return;
        }

        const nextPreviewUrl = URL.createObjectURL(file);
        objectUrlRef.current = nextPreviewUrl;
        setPreviewUrl(nextPreviewUrl);
    }

    return (
        <div className="sm:col-span-2">
            <label
                htmlFor="site-logo-file"
                className="text-sm font-semibold text-zinc-200"
            >
                Website logo
            </label>

            <div className="mt-3 flex flex-col gap-4 rounded-2xl border border-dashed border-white/15 bg-black/30 p-4 sm:flex-row sm:items-center">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/50 p-2">
                    {previewUrl ? (
                        <Image
                            src={previewUrl}
                            alt="Selected website logo preview"
                            width={88}
                            height={88}
                            unoptimized={previewUrl.startsWith("blob:")}
                            className="h-full w-full object-contain"
                        />
                    ) : (
                        <span className="text-center text-xs text-zinc-600">
                            Default 7 icon
                        </span>
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <input
                        id="site-logo-file"
                        name="logoFile"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleFileChange}
                        className="block w-full cursor-pointer rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-zinc-300 file:mr-4 file:rounded-lg file:border-0 file:bg-yellow-300 file:px-4 file:py-2 file:text-xs file:font-black file:text-black"
                    />

                    <p className="mt-2 text-xs leading-5 text-zinc-500">
                        PNG, JPG or WebP. Maximum 2MB. Leave empty to keep the current logo.
                    </p>

                    {currentLogoUrl && (
                        <label className="mt-3 flex items-center gap-3 text-xs font-semibold text-zinc-400">
                            <input
                                name="removeLogo"
                                type="checkbox"
                                className="h-4 w-4 accent-yellow-300"
                            />
                            Remove current logo and use the default 7 icon
                        </label>
                    )}
                </div>
            </div>
        </div>
    );
}
