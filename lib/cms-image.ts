export const cmsImageMaximumBytes = 2 * 1024 * 1024;

export const cmsImageAccept = [
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    "image/png",
    "image/jpeg",
    "image/webp",
].join(",");

export type DetectedCmsImageType = {
    contentType: "image/jpeg" | "image/png" | "image/webp";
    extension: "jpg" | "png" | "webp";
};

function startsWithBytes(
    bytes: Uint8Array,
    signature: readonly number[],
) {
    return (
        bytes.length >= signature.length &&
        signature.every((value, index) => bytes[index] === value)
    );
}

function readAscii(bytes: Uint8Array, start: number, end: number) {
    return String.fromCharCode(...bytes.slice(start, end));
}

export function detectCmsImageType(
    bytes: Uint8Array,
): DetectedCmsImageType | null {
    if (
        startsWithBytes(bytes, [
            0x89,
            0x50,
            0x4e,
            0x47,
            0x0d,
            0x0a,
            0x1a,
            0x0a,
        ])
    ) {
        return {
            contentType: "image/png",
            extension: "png",
        };
    }

    if (startsWithBytes(bytes, [0xff, 0xd8, 0xff])) {
        return {
            contentType: "image/jpeg",
            extension: "jpg",
        };
    }

    if (
        bytes.length >= 16 &&
        readAscii(bytes, 0, 4) === "RIFF" &&
        readAscii(bytes, 8, 12) === "WEBP" &&
        ["VP8 ", "VP8L", "VP8X"].includes(
            readAscii(bytes, 12, 16),
        )
    ) {
        return {
            contentType: "image/webp",
            extension: "webp",
        };
    }

    return null;
}
