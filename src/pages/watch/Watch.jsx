// src/pages/watch/Watch.jsx
// Public watch page with:
// - thumbnailUrl as video poster (shown before play)
// - blurred thumbnail background behind player
// - dynamic og:image meta tag for social sharing
// - share bar, reshare CTA, Telegram bot CTA

import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Copy, CheckCheck, Send, ExternalLink, Play, Share2, Twitter } from "lucide-react";
import VideoPlayer from "../../Components/video/VideoPlayer";
import { resolveShortLink } from "../../services/link.service";
import { ROUTES } from "../../constants/routes";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

// ── OG Meta Tag Manager ───────────────────────────────────────────────────────
// Injects/updates og:image, og:title, og:description into document.head.
// Cleans up on unmount. No external library needed.
function useOgMeta({ title, description, imageUrl, url }) {
  useEffect(() => {
    const setMeta = (property, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("og:title", title);
    setMeta("og:description", description || title);
    setMeta("og:image", imageUrl);
    setMeta("og:url", url);
    setMeta("og:type", "video.other");

    // Twitter card
    const setTwitter = (name, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    setTwitter("twitter:card", imageUrl ? "summary_large_image" : "summary");
    setTwitter("twitter:title", title);
    setTwitter("twitter:image", imageUrl);

    return () => {
      // Reset to defaults on unmount
      ["og:title","og:description","og:image","og:url","og:type"].forEach(p => {
        document.querySelector(`meta[property="${p}"]`)?.removeAttribute("content");
      });
    };
  }, [title, description, imageUrl, url]);
}

// ── Share helpers ─────────────────────────────────────────────────────────────
function buildShareUrls(url, title) {
  return {
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    twitter:  `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  };
}

function ShareBar({ url, title }) {
  const [copied, setCopied] = useState(false);
  const share = buildShareUrls(url, title);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={handleCopy}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm border transition font-medium
          ${copied ? "bg-green-500/20 border-green-500/30 text-green-400" : "bg-white/10 border-white/10 text-white hover:bg-white/15"}`}>
        {copied ? <CheckCheck size={15} /> : <Copy size={15} />}
        {copied ? "Copied!" : "Copy Link"}
      </button>

      <a href={share.telegram} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-[#229ED9]/20 border border-[#229ED9]/30 text-[#229ED9] hover:bg-[#229ED9]/30 transition font-medium">
        <Send size={15} /> Telegram
      </a>

      <a href={share.whatsapp} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition font-medium">
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        WhatsApp
      </a>

      <a href={share.twitter} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-white/10 border border-white/10 text-white hover:bg-white/15 transition font-medium">
        <Twitter size={15} /> Twitter
      </a>

      {typeof navigator !== "undefined" && navigator.share && (
        <button onClick={() => navigator.share({ title, url }).catch(() => {})}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-white/10 border border-white/10 text-white hover:bg-white/15 transition font-medium sm:hidden">
          <Share2 size={15} /> Share
        </button>
      )}
    </div>
  );
}

function WatchSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <div className="aspect-video bg-white/5 rounded-2xl animate-pulse" />
        <div className="h-6 bg-white/5 rounded-lg w-2/3 animate-pulse" />
        <div className="h-4 bg-white/5 rounded-lg w-1/3 animate-pulse" />
        <div className="flex gap-2">
          {[1,2,3].map(i => <div key={i} className="h-9 w-28 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
      </div>
    </div>
  );
}

export default function Watch() {
  const { shortCode } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useDocumentTitle(data?.video?.title ?? "Watch");

  // Inject OG meta tags dynamically
  useOgMeta({
    title: data?.video?.title,
    description: data?.video?.description,
    imageUrl: data?.video?.thumbnailUrl,
    url: typeof window !== "undefined" ? window.location.href : "",
  });

  useEffect(() => {
    if (!shortCode) return;
    resolveShortLink(shortCode)
      .then(setData)
      .catch(err => setError(err.message || "Video not found."))
      .finally(() => setLoading(false));
  }, [shortCode]);

  if (loading) return <WatchSkeleton />;

  if (error || !data) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">
        <div className="text-center space-y-4 px-4">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto">
            <Play size={28} className="text-white/20" />
          </div>
          <p className="text-white/60">{error || "This video is not available."}</p>
          <Link to={ROUTES.LANDING} className="text-cyan-400 hover:text-cyan-300 text-sm transition block">
            ← Back to ClipNova
          </Link>
        </div>
      </div>
    );
  }

  const { video, link } = data;
  const watchUrl = `${window.location.origin}/watch/${shortCode}`;
  const hasThumbnail = !!video.thumbnailUrl;

  return (
    <div className="min-h-screen bg-neutral-950 text-white relative overflow-hidden">
      {/* Blurred thumbnail background — only shown if thumbnailUrl exists */}
      {hasThumbnail && (
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          aria-hidden="true"
        >
          <img
            src={video.thumbnailUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover opacity-10 blur-3xl scale-110"
          />
          {/* Dark overlay to keep text readable */}
          <div className="absolute inset-0 bg-neutral-950/80" />
        </div>
      )}

      {/* Content — above blurred background */}
      <div className="relative z-10">
        {/* Navbar */}
        <nav className="border-b border-white/5 px-4 py-3 sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-md">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link to={ROUTES.LANDING}
              className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              ClipNova
            </Link>
            <Link to={ROUTES.REGISTER}
              className="text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-1.5 rounded-xl hover:opacity-90 transition">
              Start Earning
            </Link>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
          {/* Player — with thumbnailUrl as poster */}
          {video.videoUrl ? (
            <VideoPlayer
              videoUrl={video.videoUrl}
              posterUrl={video.thumbnailUrl}
              linkId={link.id}
              title={video.title}
            />
          ) : (
            // No video URL yet — show thumbnail as placeholder with processing message
            <div className="aspect-video bg-neutral-900 rounded-2xl overflow-hidden relative">
              {hasThumbnail ? (
                <>
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    loading="lazy"
                    className="w-full h-full object-cover opacity-40"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Play size={24} className="text-white/50 ml-1" />
                      </div>
                      <p className="text-white/50 text-sm">Video processing... Please check back soon.</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white/40 text-sm">Video processing... Please check back soon.</p>
                </div>
              )}
            </div>
          )}

          {/* Title */}
          <div>
            <h1 className="text-xl font-bold leading-snug">{video.title}</h1>
            {video.description && (
              <p className="text-white/50 text-sm mt-2 leading-relaxed">{video.description}</p>
            )}
          </div>

          {/* Share bar */}
          <ShareBar url={watchUrl} title={video.title} />

          {/* Reshare CTA */}
          <div className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-white/10 rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-semibold text-sm flex items-center gap-2">
                  🔁 Earn by resharing this video
                </p>
                <p className="text-white/40 text-xs mt-1">
                  Register on ClipNova, reshare this link, and earn for every view through your link.
                </p>
              </div>
              <Link to={ROUTES.REGISTER}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 transition shrink-0">
                Reshare & Earn <ExternalLink size={14} />
              </Link>
            </div>
          </div>

          {/* Telegram bot CTA */}
          <div className="bg-[#229ED9]/10 border border-[#229ED9]/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-semibold text-sm">📱 Upload via Telegram Bot</p>
              <p className="text-white/40 text-xs mt-1">
                Send videos directly to @clipnova_bot and start earning instantly.
              </p>
            </div>
            <a href="https://t.me/clipnovaaBot" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-[#229ED9] hover:bg-[#1a8bc4] text-white transition shrink-0">
              <Send size={15} /> Open Bot
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
