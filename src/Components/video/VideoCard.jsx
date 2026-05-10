// src/components/video/VideoCard.jsx
// Reusable video card used in:
//   - Dashboard recent videos
//   - UploadedVideos page
//   - Admin videos page
//
// Features:
//   - thumbnailUrl as card image (lazy loaded)
//   - shimmer skeleton while image loads
//   - dark placeholder with play icon if thumbnailUrl is null
//   - title overlay on thumbnail
//   - status badge
//   - action slot (delete, view, etc.)

import { useState } from "react";
import { Play } from "lucide-react";

const STATUS_STYLES = {
  READY:     "bg-green-500/20 text-green-400 border-green-500/30",
  UPLOADING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  FAILED:    "bg-red-500/20 text-red-400 border-red-500/30",
  DELETED:   "bg-white/5 text-white/30 border-white/10",
};

function StatusBadge({ status }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLES[status] ?? STATUS_STYLES.DELETED}`}>
      {status}
    </span>
  );
}

// ── Thumbnail with shimmer + lazy load ───────────────────────────────────────
function Thumbnail({ src, alt }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const showPlaceholder = !src || errored;

  return (
    <div className="relative w-full h-36 bg-neutral-900 overflow-hidden">
      {/* Shimmer — shown while image is loading */}
      {!loaded && !showPlaceholder && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse" />
      )}

      {showPlaceholder ? (
        // Dark placeholder with play icon
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-900">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <Play size={18} className="text-white/30 ml-0.5" fill="currentColor" />
          </div>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}

// ── VideoCard ────────────────────────────────────────────────────────────────
/**
 * @param {Object} props
 * @param {Object}   props.video        - video object from API
 * @param {string}   props.video._id
 * @param {string}   props.video.title
 * @param {string}   [props.video.thumbnailUrl]
 * @param {string}   props.video.status
 * @param {string}   [props.video.createdAt]
 * @param {number}   [props.video.views]
 * @param {ReactNode} [props.actions]   - action buttons slot (delete, view, etc.)
 * @param {Function} [props.onClick]    - click handler for the card
 */
export default function VideoCard({ video, actions, onClick }) {
  return (
    <div
      className={`bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition group ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <Thumbnail src={video.thumbnailUrl} alt={video.title} />

      {/* Info */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-sm text-white leading-snug line-clamp-2 flex-1">
            {video.title}
          </p>
          <StatusBadge status={video.status} />
        </div>

        {/* Actions slot */}
        {actions && <div className="flex gap-2 pt-1">{actions}</div>}
      </div>
    </div>
  );
}

// ── VideoCard Skeleton ───────────────────────────────────────────────────────
export function VideoCardSkeleton() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <div className="h-36 bg-white/5 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-white/10 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-white/10 rounded animate-pulse w-1/2" />
      </div>
    </div>
  );
}
