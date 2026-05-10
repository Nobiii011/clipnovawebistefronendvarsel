// src/hooks/useUpload.js
// Upload state machine:
//   idle → creating → [thumbnail?] → initiating → uploading → completing → done | error
//
// startUpload(file, metadata, thumbnailFile?)
// thumbnailFile is optional — if omitted backend auto-generates thumbnail.
// Thumbnail failure is NON-FATAL — upload continues, thumbnailWarning is set.

import { useState, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import { createVideo } from "../services/video.service";
import {
  initiateUpload,
  uploadToR2,
  completeUpload,
  uploadThumbnail,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
} from "../services/upload.service";

export const UPLOAD_STAGES = {
  IDLE:       "idle",
  CREATING:   "creating",     // POST /videos
  THUMBNAIL:  "thumbnail",    // POST /uploads/thumbnail (optional)
  INITIATING: "initiating",   // POST /uploads/initiate
  UPLOADING:  "uploading",    // PUT signed URL → R2
  COMPLETING: "completing",   // POST /uploads/complete
  DONE:       "done",
  ERROR:      "error",
};

const STAGE_LABELS = {
  [UPLOAD_STAGES.CREATING]:   "Creating video record...",
  [UPLOAD_STAGES.THUMBNAIL]:  "Uploading thumbnail...",
  [UPLOAD_STAGES.INITIATING]: "Preparing upload...",
  [UPLOAD_STAGES.UPLOADING]:  "Uploading to storage...",
  [UPLOAD_STAGES.COMPLETING]: "Verifying upload...",
  [UPLOAD_STAGES.DONE]:       "Upload complete!",
};

export function useUpload() {
  const qc = useQueryClient();
  const [stage, setStage]                   = useState(UPLOAD_STAGES.IDLE);
  const [progress, setProgress]             = useState(0);
  const [error, setError]                   = useState(null);
  const [result, setResult]                 = useState(null);
  // Non-fatal warning shown when thumbnail upload fails but video upload succeeds
  const [thumbnailWarning, setThumbnailWarning] = useState(null);

  const abortControllerRef = useRef(null);
  const abortedRef         = useRef(false);

  const reset = useCallback(() => {
    abortedRef.current = false;
    setStage(UPLOAD_STAGES.IDLE);
    setProgress(0);
    setError(null);
    setResult(null);
    setThumbnailWarning(null);
  }, []);

  const abort = useCallback(() => {
    abortedRef.current = true;
    abortControllerRef.current?.abort();
    setStage(UPLOAD_STAGES.IDLE);
    setProgress(0);
    setError(null);
    setThumbnailWarning(null);
  }, []);

  const validateFile = useCallback((file) => {
    if (!file) return "No file selected.";
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return `Unsupported format. Allowed: MP4, MOV, WebM. Got: ${file.type || "unknown"}`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size is 1 GB. Your file: ${(file.size / 1e9).toFixed(2)} GB`;
    }
    if (file.size === 0) return "File is empty.";
    return null;
  }, []);

  /**
   * @param {File} file           - video file (must be real File instance)
   * @param {{ title: string, description?: string }} metadata
   * @param {File|null} thumbnailFile - optional thumbnail (must be real File instance)
   */
  const startUpload = useCallback(async (file, metadata, thumbnailFile = null) => {
    const fileError = validateFile(file);
    if (fileError) {
      setError(fileError);
      setStage(UPLOAD_STAGES.ERROR);
      return;
    }

    const ac = new AbortController();
    abortControllerRef.current = ac;
    abortedRef.current = false;
    setError(null);
    setResult(null);
    setProgress(0);
    setThumbnailWarning(null);

    try {
      // STEP 1: Create video record
      setStage(UPLOAD_STAGES.CREATING);
      const video = await createVideo({
        title: metadata.title.trim(),
        description: metadata.description?.trim() || undefined,
      });
      if (abortedRef.current) return;

      // STEP 2 (optional): Upload thumbnail — NON-FATAL
      // Guard: only attempt if thumbnailFile is a real File/Blob instance.
      // If it's a plain object (serialization bug), skip silently.
      if (thumbnailFile) {
        if (thumbnailFile instanceof File || thumbnailFile instanceof Blob) {
          setStage(UPLOAD_STAGES.THUMBNAIL);
          try {
            await uploadThumbnail(video._id, thumbnailFile);
          } catch (thumbErr) {
            // Thumbnail failed — log warning, continue upload
            // Backend will auto-generate thumbnail from video
            console.warn("[useUpload] Thumbnail upload failed (non-fatal):", thumbErr?.message);
            setThumbnailWarning("Thumbnail upload failed — a thumbnail will be auto-generated.");
          }
          if (abortedRef.current) return;
        } else {
          // thumbnailFile is not a real File — skip silently, warn in dev
          console.warn("[useUpload] thumbnailFile is not a File instance, skipping thumbnail upload.", thumbnailFile);
          setThumbnailWarning("Thumbnail could not be uploaded — a thumbnail will be auto-generated.");
        }
      }

      // STEP 3: Get signed upload URL
      setStage(UPLOAD_STAGES.INITIATING);
      const { uploadUrl } = await initiateUpload({
        videoId:  video._id,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      });
      if (abortedRef.current) return;

      if (!uploadUrl) throw new Error("No upload URL returned from server.");

      // STEP 4: PUT directly to R2 — no auth header
      setStage(UPLOAD_STAGES.UPLOADING);
      await uploadToR2(uploadUrl, file, (pct) => {
        if (!abortedRef.current) setProgress(pct);
      }, ac.signal);
      if (abortedRef.current) return;

      // STEP 5: Notify backend upload is complete
      setStage(UPLOAD_STAGES.COMPLETING);
      const completed = await completeUpload(video._id);
      if (abortedRef.current) return;

      setResult(completed);
      setStage(UPLOAD_STAGES.DONE);
      qc.invalidateQueries({ queryKey: queryKeys.videos() });
    } catch (err) {
      if (!abortedRef.current) {
        setError(err.message || "Upload failed. Please try again.");
        setStage(UPLOAD_STAGES.ERROR);
      }
    }
  }, [validateFile, qc]);

  const stageLabel = STAGE_LABELS[stage] ?? "";
  const isActive   = ![UPLOAD_STAGES.IDLE, UPLOAD_STAGES.DONE, UPLOAD_STAGES.ERROR].includes(stage);

  return {
    stage,
    stageLabel,
    progress,
    error,
    result,
    thumbnailWarning,
    isActive,
    startUpload,
    reset,
    abort,
    validateFile,
    ALLOWED_MIME_TYPES,
    MAX_FILE_SIZE,
  };
}
