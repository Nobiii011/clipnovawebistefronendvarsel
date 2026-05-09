// src/pages/creator/UploadVideo.jsx
// Full 4-step upload flow:
//   1. POST /videos          → create DB record
//   2. POST /uploads/initiate → get signed PUT URL
//   3. PUT  signedUrl         → direct browser → R2 (with progress)
//   4. POST /uploads/complete → HeadObject verify → status = READY

import { useState, useCallback, useRef } from "react";
import { UploadCloud, FileVideo, X, CheckCircle, AlertCircle } from "lucide-react";
import { useUpload, UPLOAD_STAGES } from "../../hooks/useUpload";
import { formatFileSize } from "../../lib/formatters";
import Toast from "../../Components/ui/Toast";

const ACCEPTED_MIME = ["video/mp4", "video/quicktime", "video/webm"];
const ACCEPT_ATTR   = ".mp4,.mov,.webm,video/mp4,video/quicktime,video/webm";

// ── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ percent }) {
  return (
    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 rounded-full"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

// ── Stage Indicator ──────────────────────────────────────────────────────────
function StageIndicator({ stage, stageLabel, progress }) {
  const stages = [
    UPLOAD_STAGES.CREATING,
    UPLOAD_STAGES.INITIATING,
    UPLOAD_STAGES.UPLOADING,
    UPLOAD_STAGES.COMPLETING,
  ];
  const currentIdx = stages.indexOf(stage);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/70 font-medium">{stageLabel}</span>
        {stage === UPLOAD_STAGES.UPLOADING && (
          <span className="text-cyan-400 font-mono">{progress}%</span>
        )}
      </div>

      {stage === UPLOAD_STAGES.UPLOADING && (
        <ProgressBar percent={progress} />
      )}

      <div className="flex gap-2">
        {stages.map((s, i) => (
          <div
            key={s}
            className={`flex-1 h-1 rounded-full transition-all duration-500 ${
              i < currentIdx
                ? "bg-green-500"
                : i === currentIdx
                ? "bg-cyan-400 animate-pulse"
                : "bg-white/10"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function UploadVideo() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState("");
  const [toast, setToast] = useState(null);
  const inputRef = useRef(null);

  const { stage, stageLabel, progress, error, result, isActive, startUpload, reset, validateFile } = useUpload();

  const handleFile = useCallback((f) => {
    if (!f) return;
    const err = validateFile(f);
    if (err) {
      setFileError(err);
      setFile(null);
      return;
    }
    setFileError("");
    setFile(f);
    // Auto-fill title from filename if empty
    if (!title) {
      setTitle(f.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ").trim());
    }
  }, [validateFile, title]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title.trim() || isActive) return;

    await startUpload(file, { title, description });
  };

  const handleReset = () => {
    reset();
    setFile(null);
    setTitle("");
    setDescription("");
    setFileError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  // Show success state
  if (stage === UPLOAD_STAGES.DONE && result) {
    return (
      <div className="space-y-6 text-white max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold">Upload Video</h1>
        </div>

        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle size={24} className="text-green-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-green-300 font-semibold text-lg">Upload Complete!</p>
              <p className="text-green-400/70 text-sm mt-1">
                Your video has been uploaded and verified successfully.
              </p>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/50">Title</span>
              <span className="text-white font-medium">{result.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Status</span>
              <span className="text-green-400 font-medium">{result.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Video ID</span>
              <code className="text-white/60 text-xs bg-white/10 px-1.5 py-0.5 rounded">{result._id}</code>
            </div>
            {result.storageKey && (
              <div className="flex justify-between">
                <span className="text-white/50">Storage Key</span>
                <code className="text-white/40 text-xs truncate max-w-[200px]">{result.storageKey}</code>
              </div>
            )}
          </div>

          <button
            onClick={handleReset}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/15 transition"
          >
            Upload Another Video
          </button>
        </div>
      </div>
    );
  }

  const canSubmit = file && title.trim().length > 0 && !isActive;

  return (
    <div className="space-y-6 text-white max-w-2xl">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div>
        <h1 className="text-2xl font-bold">Upload Video</h1>
        <p className="text-white/40 text-sm mt-1">
          MP4, MOV, WebM — max 1 GB
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1.5">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter video title"
            maxLength={200}
            required
            disabled={isActive}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition disabled:opacity-50"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1.5">
            Description <span className="text-white/30 text-xs">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your video"
            rows={3}
            maxLength={2000}
            disabled={isActive}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition resize-none disabled:opacity-50"
          />
        </div>

        {/* Drop Zone */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1.5">
            Video File <span className="text-red-400">*</span>
          </label>

          {!file ? (
            <div
              className={`relative border-2 border-dashed rounded-2xl p-10 transition-all cursor-pointer
                ${isActive ? "opacity-50 pointer-events-none" : ""}
                ${dragActive
                  ? "border-cyan-400 bg-cyan-400/5"
                  : "border-white/15 bg-white/3 hover:border-white/25 hover:bg-white/5"
                }`}
              onDragOver={(e) => { e.preventDefault(); if (!isActive) setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => !isActive && inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPT_ATTR}
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
                disabled={isActive}
              />
              <div className="flex flex-col items-center gap-3 text-center pointer-events-none">
                <UploadCloud size={40} className={`transition ${dragActive ? "text-cyan-400" : "text-white/30"}`} />
                <div>
                  <p className="text-sm font-medium text-white/70">
                    {dragActive ? "Drop to upload" : "Drag & drop or click to browse"}
                  </p>
                  <p className="text-xs text-white/30 mt-1">MP4, MOV, WebM — max 1 GB</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
              <div className="bg-cyan-500/20 p-2.5 rounded-lg shrink-0">
                <FileVideo size={20} className="text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-white/40 mt-0.5">{formatFileSize(file.size)} · {file.type}</p>
              </div>
              {!isActive && (
                <button
                  type="button"
                  onClick={() => { setFile(null); if (inputRef.current) inputRef.current.value = ""; }}
                  className="text-white/30 hover:text-red-400 transition shrink-0 p-1"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          )}

          {fileError && (
            <p className="flex items-center gap-1.5 text-red-400 text-xs mt-2">
              <AlertCircle size={13} /> {fileError}
            </p>
          )}
        </div>

        {/* Upload Progress */}
        {isActive && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <StageIndicator stage={stage} stageLabel={stageLabel} progress={progress} />
          </div>
        )}

        {/* Error State */}
        {stage === UPLOAD_STAGES.ERROR && error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-300 text-sm font-medium">Upload failed</p>
              <p className="text-red-400/70 text-xs mt-1">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => { reset(); }}
              className="text-white/40 hover:text-white transition text-xs shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full sm:w-auto px-8 py-3 rounded-xl font-medium text-sm transition
            bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90
            disabled:opacity-40 disabled:cursor-not-allowed
            flex items-center justify-center gap-2"
        >
          {isActive ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {stageLabel}
            </>
          ) : (
            <>
              <UploadCloud size={16} />
              Upload Video
            </>
          )}
        </button>
      </form>
    </div>
  );
}
