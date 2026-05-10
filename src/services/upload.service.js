// src/services/upload.service.js
// Backend upload flow:
// 1. POST /uploads/initiate  { videoId, fileName, fileSize, mimeType }
//    → { uploadUrl (signed PUT to R2), storageKey, expiresAt }
// 2. PUT uploadUrl  (direct browser → R2, XHR for progress)
// 3. POST /uploads/complete  { videoId }
//    → HeadObject verify → video.status = READY
// 4. POST /uploads/thumbnail { videoId, formData(file) }  [optional]
//    → { thumbnailUrl }

import apiClient from "../api/client";
import { normalizeError } from "../lib/apiError";

export const ALLOWED_MIME_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
export const MAX_FILE_SIZE = 1073741824; // 1 GB

export const ALLOWED_THUMBNAIL_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024; // 5 MB

const R2_BUCKET_HOST = "clipnova.9eb21a93fe24eb749b65eaa4252d2319.r2.cloudflarestorage.com";
const IS_DEV = import.meta.env.DEV;

function proxyR2Url(signedUrl) {
  if (!IS_DEV) return signedUrl;
  try {
    const url = new URL(signedUrl);
    if (url.hostname === R2_BUCKET_HOST) {
      return `/r2-upload${url.pathname}${url.search}`;
    }
  } catch {
    // not a valid URL, return as-is
  }
  return signedUrl;
}

export async function initiateUpload({ videoId, fileName, fileSize, mimeType }) {
  try {
    const { data } = await apiClient.post("/uploads/initiate", { videoId, fileName, fileSize, mimeType });
    return data.data; // { uploadUrl, storageKey, expiresAt }
  } catch (err) {
    throw normalizeError(err);
  }
}

export function uploadToR2(uploadUrl, file, onProgress, signal) {
  const url = proxyR2Url(uploadUrl);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        const match = xhr.responseText?.match(/<Message>(.*?)<\/Message>/);
        const msg = match ? match[1] : `Upload failed (HTTP ${xhr.status})`;
        reject(new Error(msg));
      }
    });

    xhr.addEventListener("error", () =>
      reject(new Error("Upload failed. Check your internet connection and try again."))
    );
    xhr.addEventListener("abort", () => reject(new Error("Upload was cancelled.")));
    xhr.addEventListener("timeout", () => reject(new Error("Upload timed out. Please try again.")));

    if (signal) signal.addEventListener("abort", () => xhr.abort());

    xhr.timeout = 0;
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.withCredentials = false;
    xhr.send(file);
  });
}

export async function completeUpload(videoId) {
  try {
    const { data } = await apiClient.post("/uploads/complete", { videoId });
    return data.data;
  } catch (err) {
    throw normalizeError(err);
  }
}

/**
 * Upload a thumbnail image for a video.
 * Called AFTER the video record is created (videoId required).
 * If skipped, backend auto-generates a thumbnail.
 * @param {string} videoId
 * @param {File} file - jpg/png/webp, max 5MB
 * @returns {{ thumbnailUrl: string }}
 */
export async function uploadThumbnail(videoId, file) {
  // CRITICAL: file MUST be a real File/Blob instance — never a plain object.
  // Debug guard: log before sending so any regression is immediately visible.
  if (import.meta.env.DEV) {
    console.log("[uploadThumbnail] file instanceof File:", file instanceof File);
    console.log("[uploadThumbnail] file.name:", file?.name, "file.size:", file?.size);
  }

  if (!(file instanceof File) && !(file instanceof Blob)) {
    throw new Error("uploadThumbnail: received non-File argument. Upload aborted.");
  }

  const formData = new FormData();
  formData.append("thumbnail", file, file.name);
  formData.append("videoId", videoId);

  if (import.meta.env.DEV) {
    console.log("[uploadThumbnail] formData.get('thumbnail'):", formData.get("thumbnail"));
  }

  try {
    // IMPORTANT: The apiClient instance has a default `Content-Type: application/json`
    // header which causes axios transformRequest to JSON.stringify FormData → `{}` (empty).
    // Fix: explicitly delete Content-Type for this request so the browser sets
    // `multipart/form-data; boundary=...` automatically.
    const { data } = await apiClient.post("/uploads/thumbnail", formData, {
      headers: { "Content-Type": undefined },
    });
    return data.data; // { thumbnailUrl }
  } catch (err) {
    throw normalizeError(err);
  }
}

/**
 * Validate a thumbnail file before upload.
 * Returns error string or null if valid.
 */
export function validateThumbnail(file) {
  if (!file) return "No file selected.";
  if (!ALLOWED_THUMBNAIL_TYPES.includes(file.type)) {
    return "Unsupported format. Allowed: JPG, PNG, WebP.";
  }
  if (file.size > MAX_THUMBNAIL_SIZE) {
    return `File too large. Maximum size is 5 MB.`;
  }
  if (file.size === 0) return "File is empty.";
  return null;
}
