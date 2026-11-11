/**
 * Inspiration images for lead forms. The browser resizes and re-encodes each
 * image to a JPEG before upload, so a 5 MB phone photo becomes about 300 KB. The images are
 * attached to the lead email Rayane receives. The limits below are shared
 * with /api/send-email, which re-checks everything server-side.
 */

export const MAX_INSPIRATION_IMAGES = 3;
/** Max decoded size per attachment accepted by the API (bytes). */
export const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024;
export const ALLOWED_ATTACHMENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
] as const;

export type LeadAttachment = {
  filename: string;
  contentType: string;
  /** Base64, without the data: URL prefix. */
  content: string;
};

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function baseName(name: string) {
  const stem = name.replace(/\.[^.]+$/, "").replace(/[^\w-]+/g, "-").replace(/^-+|-+$/g, "");
  return (stem || "inspiration").slice(0, 60);
}

/**
 * Resizes to at most 1600 px and re-encodes as JPEG. If the browser can't
 * decode the file (e.g. HEIC outside Safari), the original is sent as-is,
 * provided it's an allowed type and small enough. Otherwise this throws, and
 * the form shows a friendly error.
 */
export async function prepareImageAttachment(file: File): Promise<LeadAttachment> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d context");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );
    if (!blob) throw new Error("encode failed");
    return {
      filename: `${baseName(file.name)}.jpg`,
      contentType: "image/jpeg",
      content: await blobToBase64(blob),
    };
  } catch {
    const type = file.type.toLowerCase();
    if (
      (ALLOWED_ATTACHMENT_TYPES as readonly string[]).includes(type) &&
      file.size <= MAX_ATTACHMENT_BYTES
    ) {
      const ext = type.split("/")[1] === "jpeg" ? "jpg" : type.split("/")[1];
      return {
        filename: `${baseName(file.name)}.${ext}`,
        contentType: type,
        content: await blobToBase64(file),
      };
    }
    throw new Error("unsupported image");
  }
}
