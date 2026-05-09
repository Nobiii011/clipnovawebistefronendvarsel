// src/pages/creator/UploadedVideos.jsx
import { useState, useCallback } from "react";
import { Video, Trash2, RefreshCw, Search, Eye, Link2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useVideos, useDeleteVideo } from "../../hooks/useVideos";
import { formatDate } from "../../lib/formatters";
import { Skeleton } from "../../Components/ui/Skeleton";
import { EmptyState, ErrorState } from "../../Components/ui/States";
import Toast from "../../Components/ui/Toast";
import { ROUTES } from "../../constants/routes";

const STATUS_STYLES = {
  READY:     "bg-green-500/20 text-green-400 border-green-500/30",
  UPLOADING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  FAILED:    "bg-red-500/20 text-red-400 border-red-500/30",
  DELETED:   "bg-white/5 text-white/30 border-white/10",
};

function StatusBadge({ status }) {
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_STYLES[status] ?? STATUS_STYLES.DELETED}`}>
      {status}
    </span>
  );
}

function VideoCardSkeleton() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
      <div className="bg-white/10 rounded-xl h-36 animate-pulse" />
      <div className="space-y-2">
        <div className="h-4 bg-white/10 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-white/10 rounded animate-pulse w-1/2" />
      </div>
    </div>
  );
}

export default function UploadedVideos() {
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const { data: videos = [], isLoading, isError, error, refetch } = useVideos();
  const deleteVideo = useDeleteVideo();

  const filtered = videos.filter((v) =>
    v.title?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = useCallback(async (id, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteVideo.mutateAsync(id);
      setToast({ type: "success", message: "Video deleted." });
    } catch (err) {
      setToast({ type: "error", message: err.message });
    } finally {
      setDeletingId(null);
    }
  }, [deleteVideo]);

  return (
    <div className="space-y-6 text-white">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Uploaded Videos</h1>
          <p className="text-white/40 text-sm mt-1">
            {isLoading ? "Loading..." : `${videos.length} video${videos.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="Search videos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <VideoCardSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <ErrorState message={error?.message} onRetry={refetch} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Video size={48} />}
          title={search ? "No videos match your search" : "No videos uploaded yet"}
          description={!search ? "Upload your first video to get started" : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((video) => (
            <div
              key={video._id}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition"
            >
              {/* Thumbnail placeholder */}
              <div className="bg-white/5 h-36 flex items-center justify-center">
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Video size={32} className="text-white/20" />
                )}
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-sm leading-snug line-clamp-2">{video.title}</p>
                  <StatusBadge status={video.status} />
                </div>

                <div className="text-xs text-white/40 space-y-1">
                  <p>Uploaded {formatDate(video.createdAt)}</p>
                  {video.views != null && <p>{video.views.toLocaleString()} views</p>}
                </div>

                <div className="flex gap-2 pt-1">
                  <Link to={`/videos/${video._id}`}
                    className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition">
                    <Eye size={13} /> View
                  </Link>
                  <button
                    onClick={() => handleDelete(video._id, video.title)}
                    disabled={deletingId === video._id}
                    className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 disabled:opacity-40 transition"
                  >
                    {deletingId === video._id ? (
                      <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 size={13} />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
