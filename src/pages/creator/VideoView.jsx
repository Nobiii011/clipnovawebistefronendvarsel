// src/pages/creator/VideoView.jsx
// Route: /videos/:id
// Shows video details, player preview, link management for creator

import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { Copy, CheckCheck, Plus, ToggleLeft, ToggleRight, ArrowLeft, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getVideo } from "../../services/video.service";
import { useVideoLinks, useCreateLink, useToggleLink } from "../../hooks/useLinks";
import VideoPlayer from "../../Components/video/VideoPlayer";
import { Badge } from "../../Components/admin/AdminShared";
import { Skeleton } from "../../Components/ui/Skeleton";
import { ErrorState } from "../../Components/ui/States";
import Toast from "../../Components/ui/Toast";
import { formatDate, formatFileSize } from "../../lib/formatters";
import { ROUTES } from "../../constants/routes";

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="p-1.5 rounded-lg hover:bg-white/10 transition text-white/40 hover:text-white">
      {copied ? <CheckCheck size={14} className="text-green-400" /> : <Copy size={14} />}
    </button>
  );
}

export default function VideoView() {
  const { id } = useParams();
  const [toast, setToast] = useState(null);

  const { data: video, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["videos", id],
    queryFn: () => getVideo(id),
    enabled: !!id,
  });

  const { data: links = [], isLoading: linksLoading } = useVideoLinks(id);
  const createLink = useCreateLink();
  const toggleLink = useToggleLink();

  const handleCreateLink = async () => {
    try {
      await createLink.mutateAsync(id);
      setToast({ type: "success", message: "Share link created!" });
    } catch (err) {
      setToast({ type: "error", message: err.message });
    }
  };

  const handleToggle = async (linkId) => {
    try {
      await toggleLink.mutateAsync({ linkId });
    } catch (err) {
      setToast({ type: "error", message: err.message });
    }
  };

  const watchBase = `${window.location.origin}/watch/`;

  if (isLoading) return (
    <div className="space-y-4 text-white">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="aspect-video w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );

  if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;
  if (!video) return null;

  return (
    <div className="space-y-6 text-white max-w-3xl">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="flex items-center gap-3">
        <Link to={ROUTES.UPLOADED_VIDEOS} className="text-white/40 hover:text-white transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold">{video.title}</h1>
          <p className="text-white/40 text-xs mt-0.5">{formatDate(video.createdAt)}</p>
        </div>
        <Badge value={video.status} />
      </div>

      {/* Player */}
      {video.status === "READY" && video.storageKey ? (
        <VideoPlayer
          videoUrl={`https://pub-11c2b603246a4f87b285e337ee6ad598.r2.dev/${video.storageKey}`}
          title={video.title}
        />
      ) : (
        <div className="aspect-video bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
          <p className="text-white/30 text-sm">
            {video.status === "UPLOADING" ? "Video is still uploading..." :
             video.status === "FAILED" ? "Upload failed." :
             "Video not available for playback."}
          </p>
        </div>
      )}

      {/* Meta */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        {[
          { label: "Status", value: <Badge value={video.status} /> },
          { label: "Type", value: video.type?.replace("_", " ") },
          { label: "Size", value: video.fileSize ? formatFileSize(video.fileSize) : "—" },
          { label: "Format", value: video.mimeType?.split("/")[1]?.toUpperCase() ?? "—" },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-white/40 text-xs mb-1">{label}</p>
            <div className="font-medium">{value}</div>
          </div>
        ))}
      </div>

      {/* Share Links */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="font-semibold">Share Links</h2>
          <button onClick={handleCreateLink} disabled={createLink.isPending}
            className="flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300 transition disabled:opacity-50">
            <Plus size={15} /> {createLink.isPending ? "Creating..." : "New Link"}
          </button>
        </div>

        {linksLoading ? (
          <div className="p-5 space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-12" />)}</div>
        ) : links.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-white/30 text-sm">No share links yet.</p>
            <button onClick={handleCreateLink} className="mt-3 text-cyan-400 hover:text-cyan-300 text-sm transition">
              Create your first link →
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {links.map(link => (
              <div key={link._id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-cyan-400 text-sm font-mono">{watchBase}{link.shortCode}</code>
                    <CopyBtn text={`${watchBase}${link.shortCode}`} />
                    <a href={`/watch/${link.shortCode}`} target="_blank" rel="noopener noreferrer"
                      className="text-white/30 hover:text-white transition">
                      <ExternalLink size={13} />
                    </a>
                  </div>
                  <p className="text-white/30 text-xs mt-0.5">Created {formatDate(link.createdAt)}</p>
                </div>
                <button onClick={() => handleToggle(link._id)}
                  className={`transition ${link.isActive ? "text-green-400 hover:text-green-300" : "text-white/30 hover:text-white/50"}`}>
                  {link.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
