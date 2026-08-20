"use client";

import Image from "next/image";
import {
    type ChangeEvent,
    useEffect,
    useRef,
    useState,
} from "react";
import { useFormStatus } from "react-dom";

import {
    cmsImageAccept,
    cmsImageMaximumBytes,
    detectCmsImageType,
} from "@/lib/cms-image";

type CmsLogoUploadFieldProps = {
    currentLogoUrl?: string | null;
    emptyHelpText: string;
    emptyPreviewText?: string;
    fieldName?: string;
    idPrefix: string;
    label: string;
    maximumBytes?: number;
    objectFit?: "contain" | "cover";
    previewAlt: string;
    previewVariant?: "square" | "wide";
    required?: boolean;
};

function formatFileSize(bytes: number) {
    return `${(bytes / 1024 / 1024).toFixed(2)}MB`;
}

export function CmsLogoUploadField({
    currentLogoUrl,
    emptyHelpText,
    emptyPreviewText = "Image preview",
    fieldName = "logoFile",
    idPrefix,
    label,
    maximumBytes = cmsImageMaximumBytes,
    objectFit = "contain",
    previewAlt,
    previewVariant = "square",
    required = false,
}: CmsLogoUploadFieldProps) {
    const [previewUrl, setPreviewUrl] =
        useState(currentLogoUrl ?? "");
    const [selectedFileLabel, setSelectedFileLabel] = useState("");
    const [validationError, setValidationError] = useState("");
    const objectUrlRef = useRef<string | null>(null);
    const selectionIdRef = useRef(0);
    const { pending } = useFormStatus();

    function releasePreviewUrl() {
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
        }
    }

    useEffect(
        () => () => {
            selectionIdRef.current += 1;
            releasePreviewUrl();
        },
        [],
    );

    async function handleFileChange(
        event: ChangeEvent<HTMLInputElement>,
    ) {
        const input = event.currentTarget;
        const file = input.files?.[0];
        const selectionId = ++selectionIdRef.current;

        releasePreviewUrl();
        setSelectedFileLabel("");
        setValidationError("");

        if (!file) {
            setPreviewUrl(currentLogoUrl ?? "");
            return;
        }

        if (file.size > maximumBytes) {
            input.value = "";
            setPreviewUrl(currentLogoUrl ?? "");
            setValidationError(
                `This image is ${formatFileSize(file.size)}. Choose an image up to ${formatFileSize(maximumBytes)}.`,
            );
            return;
        }

        try {
            const header = new Uint8Array(
                await file.slice(0, 16).arrayBuffer(),
            );

            if (selectionId !== selectionIdRef.current) {
                return;
            }

            if (!detectCmsImageType(header)) {
                input.value = "";
                setPreviewUrl(currentLogoUrl ?? "");
                setValidationError(
                    "Choose a genuine PNG, JPG or WebP image.",
                );
                return;
            }

            const nextPreviewUrl = URL.createObjectURL(file);
            objectUrlRef.current = nextPreviewUrl;
            setPreviewUrl(nextPreviewUrl);
            setSelectedFileLabel(
                `${file.name} · ${formatFileSize(file.size)}`,
            );
        } catch {
            input.value = "";
            setPreviewUrl(currentLogoUrl ?? "");
            setValidationError(
                "This image could not be read. Choose another file.",
            );
        }
    }

    const inputId = `${idPrefix}-${fieldName}-file`;
    const helpId = `${idPrefix}-${fieldName}-help`;
    const errorId = `${idPrefix}-${fieldName}-error`;
    const previewClassName = previewVariant === "wide"
        ? "relative flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/50 sm:w-48"
        : "flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/50 p-2";

    return (
        <div className="sm:col-span-2">
            <label
                htmlFor={inputId}
                className="text-sm font-semibold text-zinc-200"
            >
                {label}
            </label>

            <div className="mt-3 flex flex-col gap-4 rounded-2xl border border-dashed border-white/15 bg-black/30 p-4 sm:flex-row sm:items-center">
                <div className={previewClassName}>
                    {previewUrl ? (
                        <Image
                            src={previewUrl}
                            alt={previewAlt}
                            {...(previewVariant === "wide"
                                ? { fill: true, sizes: "192px" }
                                : { width: 88, height: 88 })}
                            unoptimized={previewUrl.startsWith("blob:")}
                            className={`h-full w-full ${objectFit === "cover" ? "object-cover" : "object-contain"}`}
                        />
                    ) : (
                        <span className="text-center text-xs text-zinc-600">
                            {emptyPreviewText}
                        </span>
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <input
                        id={inputId}
                        name={fieldName}
                        type="file"
                        required={required}
                        disabled={pending}
                        accept={cmsImageAccept}
                        aria-describedby={`${helpId}${validationError ? ` ${errorId}` : ""}`}
                        aria-invalid={validationError ? true : undefined}
                        onChange={handleFileChange}
                        className="block w-full cursor-pointer rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-zinc-300 file:mr-4 file:rounded-lg file:border-0 file:bg-yellow-300 file:px-4 file:py-2 file:text-xs file:font-black file:text-black"
                    />

                    <p
                        id={helpId}
                        className="mt-2 text-xs leading-5 text-zinc-500"
                    >
                        PNG, JPG or WebP. Maximum {formatFileSize(maximumBytes)}. {emptyHelpText}
                    </p>

                    {selectedFileLabel && (
                        <p className="mt-2 break-all text-xs font-semibold text-emerald-300">
                            Ready: {selectedFileLabel}
                        </p>
                    )}

                    {validationError && (
                        <p
                            id={errorId}
                            role="alert"
                            className="mt-2 text-xs font-semibold text-red-300"
                        >
                            {validationError}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
