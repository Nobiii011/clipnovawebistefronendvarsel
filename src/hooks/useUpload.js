// src/hooks/useUpload.js
// Manages the full 3-step upload state machine:
//   idle → creating → initiating → uploading → completing → done | error
//
// Exposes a single startUpload(file, metadata) function.
// Progress is tracked via XHR upload events.

import { useState, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";
import { createVideo } from "../services/video.service";
import { initiateUpload, uploadToR2, completeUpload, ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "../services/upload.service";

export const UPLOAD_STAGES = {
  IDLE:       "idle",
  CREATING:   "creating",    // POST /videos
  INITIATING: "initiating",  // POST /uploads/initiate
  UPLOADING:  "uploading",   // PUT signed URL → R2
  COMPLETING: "completing",  // POST /uploads/complete
  DONE:       "done",
  ERROR:      "error",
};

const STAGE_LABELS = {
  [UPLOAD_STAGES.CREATING]:   "Creating video record...",
  [UPLOAD_STAGES.INITIATING]: "Preparing upload...",
  [UPLOAD_STAGES.UPLOADING]:  "Uploading to storage...",
  [UPLOAD_STAGES.COMPLETING]: "Verifying upload...",
  [UPLOAD_STAGES.DONE]:       "Upload complete!",
};

export function useUpload() {
  const qc = useQueryClient();
  const [stage, setStage] = useState(UPLOAD_STAGES.IDLE);
  const [progress, setProgress] = useState(0);   // 0–100 during UPLOADING
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);     // completed video object
  const abortRef = useRef(false);

  const reset = useCallback(() => {
    abortRef.current = false;
    setStage(UPLOAD_STAGES.IDLE);
    setProgress(0);
    setError(null);
    setResult(null);
  }, []);

  /**
   * Validate file before starting upload.
   * Returns error string or null.
   */
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
   * Full upload flow: create → initiate → upload → complete
   * @param {File}   file
   * @param {{ title: string, description?: string }} metadata
   */
  const startUpload = useCallback(async (file, metadata) => {
    const fileError = validateFile(file);
    if (fileError) {
      setError(fileError);
      setStage(UPLOAD_STAGES.ERROR);
      return;
    }

    abortRef.current = false;
    setError(null);
    setResult(null);
    setProgress(0);

    try {
      // ── STEP 1: Create video record ──────────────────────────────────────
      setStage(UPLOAD_STAGES.CREATING);
      const video = await createVideo({
        title: metadata.title.trim(),
        description: metadata.description?.trim() || undefined,
      });
      if (abortRef.current) return;

      // ── STEP 2: Get signed upload URL ────────────────────────────────────
      setStage(UPLOAD_STAGES.INITIATING);
      const { uploadUrl } = await initiateUpload({
        videoId: video._id,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      });
      if (abortRef.current) return;

      // ── STEP 3: Upload directly to R2 ────────────────────────────────────
      setStage(UPLOAD_STAGES.UPLOADING);
      await uploadToR2(uploadUrl, file, (pct) => {
        if (!abortRef.current) setProgress(pct);
      });
      if (abortRef.current) return;

      // ── STEP 4: Verify + mark READY ──────────────────────────────────────
      setStage(UPLOAD_STAGES.COMPLETING);
      const completed = await completeUpload(video._id);
      if (abortRef.current) return;

      setResult(completed);
      setStage(UPLOAD_STAGES.DONE);

      // Invalidate video list so dashboard + uploaded videos refresh
      qc.invalidateQueries({ queryKey: queryKeys.videos() });
    } catch (err) {
      if (!abortRef.current) {
        setError(err.message || "Upload failed. Please try again.");
        setStage(UPLOAD_STAGES.ERROR);
      }
    }
  }, [validateFile, qc]);

  const stageLabel = STAGE_LABELS[stage] ?? "";
  const isActive = ![UPLOAD_STAGES.IDLE, UPLOAD_STAGES.DONE, UPLOAD_STAGES.ERROR].includes(stage);

  return {
    stage,
    stageLabel,
    progress,
    error,
    result,
    isActive,
    startUpload,
    reset,
    validateFile,
    ALLOWED_MIME_TYPES,
    MAX_FILE_SIZE,
  };
}
