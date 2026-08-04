"use client";

import Image from "next/image";
import {
    type ChangeEvent,
    useEffect,
    useRef,
    useState,
} from "react";

type PromotionImageUploadFieldProps = {
    currentImageUrl?: string | null;
    idPrefix: string;
};

export function PromotionImageUploadField({
    currentImageUrl,
    idPrefix,
}: PromotionImageUploadFieldProps) {
    const [previewUrl, setPreviewUrl] =
        useState(currentImageUrl ?? "");
    const objectUrlRef = useRef<string | null>(null);

    useEffect(
        () => () => {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
            }
        },
        [],
    );

    function handleFileChange(
        event: ChangeEvent<HTMLInputElement>,
    ) {
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
        }

        const file = event.target.files?.[0];

        if (!file) {
            setPreviewUrl(currentImageUrl ?? "");
            return;
        }

        const nextPreviewUrl = URL.createObjectURL(file);
        objectUrlRef.current = nextPreviewUrl;
        setPreviewUrl(nextPreviewUrl);
    }

    return (
        <div className="sm:col-span-2">
            <label
                htmlFor={`${idPrefix}-image-file`}
                className="text-sm font-semibold text-zinc-200"
            >
                Promotion image
            </label>

            <div className="mt-3 flex flex-col gap-4 rounded-2xl border border-dashed border-white/15 bg-black/30 p-4 sm:flex-row sm:items-center">
                <div className="relative flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/50 sm:w-48">
                    {previewUrl ? (
                        <Image
                            src={previewUrl}
                            alt="Selected promotion image preview"
                            fill
                            sizes="192px"
                            unoptimized={previewUrl.startsWith("blob:")}
                            className="object-cover"
                        />
                    ) : (
                        <span className="text-center text-xs text-zinc-600">
                            Optional image preview
                        </span>
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <input
                        id={`${idPrefix}-image-file`}
                        name="imageFile"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleFileChange}
                        className="block w-full cursor-pointer rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-zinc-300 file:mr-4 file:rounded-lg file:border-0 file:bg-yellow-300 file:px-4 file:py-2 file:text-xs file:font-black file:text-black"
                    />

                    <p className="mt-2 text-xs leading-5 text-zinc-500">
                        Optional PNG, JPG or WebP. Maximum 2MB.
                        {currentImageUrl
                            ? " Leave empty to keep the current image."
                            : " The card will show the 7ERA placeholder if empty."}
                    </p>
                </div>
            </div>
        </div>
    );
}
