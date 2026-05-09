// src/services/upload.service.js
// Backend upload flow:
// 1. POST /uploads/initiate  { videoId, fileName, fileSize, mimeType }
//    → { uploadUrl (signed PUT to R2), storageKey, expiresAt }
// 2. PUT uploadUrl  (direct browser → R2)
//    ⚠️  R2 CORS issue: R2 bucket has no CORS config → browser blocks XHR PUT
//    FIX: In dev, Vite proxy rewrites R2 URL through /r2-upload proxy
//    In production: R2 CORS must be configured (see CORS config below)
// 3. POST /uploads/complete  { videoId }
//    → HeadObject verify → video.status = READY
//
// R2 CORS config required (set in Cloudflare dashboard):
// [
//   {
//     "AllowedOrigins": ["http://localhost:5173","http://localhost:5175","https://yourdomain.com"],
//     "AllowedMethods": ["PUT","GET","HEAD"],
//     "AllowedHeaders": ["Content-Type","Content-Length","x-amz-checksum-crc32","x-amz-sdk-checksum-algorithm"],
//     "ExposeHeaders": ["ETag"],
//     "MaxAgeSeconds": 3600
//   }
// ]

import apiClient from "../api/client";
import { normalizeError } from "../lib/apiError";

export const ALLOWED_MIME_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
export const MAX_FILE_SIZE = 1073741824; // 1 GB

const R2_BUCKET_HOST = "clipnova.9eb21a93fe24eb749b65eaa4252d2319.r2.cloudflarestorage.com";
const IS_DEV = import.meta.env.DEV;

/**
 * Rewrite R2 signed URL to go through Vite proxy in dev.
 * In production the URL is used directly (R2 CORS must be configured).
 */
function proxyR2Url(signedUrl) {
  if (!IS_DEV) return signedUrl;
  try {
    const url = new URL(signedUrl);
    if (url.hostname === R2_BUCKET_HOST) {
      // Replace https://bucket.r2.cloudflarestorage.com/path?sig
      // with   /r2-upload/path?sig  (Vite proxy handles it)
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

/**
 * Upload file directly to R2 via signed PUT URL.
 * Uses XHR for progress tracking. No auth headers sent to R2.
 */
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

    xhr.addEventListener("abort", () =>
      reject(new Error("Upload was cancelled."))
    );

    xhr.addEventListener("timeout", () =>
      reject(new Error("Upload timed out. Please try again."))
    );

    // Abort support via AbortSignal
    if (signal) {
      signal.addEventListener("abort", () => xhr.abort());
    }

    xhr.timeout = 0; // no timeout for large files
    xhr.open("PUT", url);
    // CRITICAL: Only Content-Type. No Authorization. No cookies.
    xhr.setRequestHeader("Content-Type", file.type);
    // Explicitly do NOT send credentials
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
