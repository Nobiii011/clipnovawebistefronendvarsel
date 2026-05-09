// src/components/video/VideoPlayer.jsx
// Custom HTML5 video player with:
// - Play/pause, seek, volume, fullscreen
// - Keyboard shortcuts (Space, arrows, F, M)
// - Playback speed selector
// - Buffering indicator
// - Playback session tracking (create session → events → finalize)

import { useRef, useState, useEffect, useCallback } from "react";
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  RotateCcw, RotateCw, Settings, Loader2
} from "lucide-react";
import { createSession, sendEvent, finalizeSession } from "../../services/playback.service";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function formatTime(s) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function VideoPlayer({ videoUrl, linkId, title, onEnded }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hideControlsTimer = useRef(null);
  const sessionIdRef = useRef(null);
  const lastEventPos = useRef(0);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffering, setBuffering] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showSpeed, setShowSpeed] = useState(false);
  const [error, setError] = useState(null);

  // ── Session tracking ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!linkId) return;
    createSession(linkId, navigator.userAgent?.slice(0, 64)).then(d => {
      if (d?.sessionId) sessionIdRef.current = d.sessionId;
    });
    return () => {
      if (sessionIdRef.current) finalizeSession(sessionIdRef.current);
    };
  }, [linkId]);

  const trackEvent = useCallback((type, pos) => {
    if (!sessionIdRef.current) return;
    sendEvent(sessionIdRef.current, type, pos ?? Math.floor(currentTime));
  }, [currentTime]);

  // ── Controls visibility ───────────────────────────────────────────────────
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideControlsTimer.current);
    if (playing) {
      hideControlsTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [playing]);

  // ── Video events ──────────────────────────────────────────────────────────
  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
    // Send PROGRESS event every 5 seconds
    if (Math.floor(v.currentTime) % 5 === 0 && Math.floor(v.currentTime) !== lastEventPos.current) {
      lastEventPos.current = Math.floor(v.currentTime);
      trackEvent("PROGRESS", Math.floor(v.currentTime));
    }
    // Buffered
    if (v.buffered.length > 0) {
      setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100);
    }
  };

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      trackEvent("PLAY", Math.floor(v.currentTime));
    } else {
      v.pause();
      trackEvent("PAUSE", Math.floor(v.currentTime));
    }
  }, [trackEvent]);

  const seek = useCallback((delta) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + delta));
    trackEvent("SEEK", Math.floor(v.currentTime));
  }, [trackEvent]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      switch (e.key) {
        case " ": case "k": e.preventDefault(); togglePlay(); break;
        case "ArrowRight": e.preventDefault(); seek(10); break;
        case "ArrowLeft": e.preventDefault(); seek(-10); break;
        case "f": case "F": toggleFullscreen(); break;
        case "m": case "M": setMuted(p => !p); break;
        case "ArrowUp": e.preventDefault(); setVolume(p => Math.min(1, p + 0.1)); break;
        case "ArrowDown": e.preventDefault(); setVolume(p => Math.max(0, p - 0.1)); break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [togglePlay, seek]);

  // ── Fullscreen ────────────────────────────────────────────────────────────
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // ── Volume sync ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = muted;
    }
  }, [volume, muted]);

  // ── Speed sync ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = speed;
  }, [speed]);

  const progress = duration ? (currentTime / duration) * 100 : 0;

  if (error) {
    return (
      <div className="aspect-video bg-neutral-900 rounded-2xl flex items-center justify-center">
        <div className="text-center text-white/50">
          <p className="text-sm">Failed to load video</p>
          <p className="text-xs mt-1 text-white/30">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative bg-black rounded-2xl overflow-hidden group select-none ${fullscreen ? "rounded-none" : ""}`}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => playing && setShowControls(false)}
      onTouchStart={showControlsTemporarily}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full aspect-video cursor-pointer"
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
        onWaiting={() => setBuffering(true)}
        onCanPlay={() => setBuffering(false)}
        onEnded={() => {
          setPlaying(false);
          setShowControls(true);
          if (sessionIdRef.current) finalizeSession(sessionIdRef.current);
          trackEvent("END", Math.floor(duration));
          onEnded?.();
        }}
        onError={() => setError("Video could not be loaded.")}
        playsInline
      />

      {/* Buffering spinner */}
      {buffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Loader2 size={40} className="text-white/70 animate-spin" />
        </div>
      )}

      {/* Big play button overlay */}
      {!playing && !buffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Play size={28} className="text-white ml-1" fill="white" />
          </div>
        </div>
      )}

      {/* Controls */}
      <div className={`absolute bottom-0 left-0 right-0 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}>
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

        <div className="relative px-4 pb-3 pt-8 space-y-2">
          {/* Progress bar */}
          <div className="relative h-1 bg-white/20 rounded-full cursor-pointer group/bar"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              if (videoRef.current) {
                videoRef.current.currentTime = pct * duration;
                trackEvent("SEEK", Math.floor(pct * duration));
              }
            }}>
            {/* Buffered */}
            <div className="absolute h-full bg-white/20 rounded-full" style={{ width: `${buffered}%` }} />
            {/* Played */}
            <div className="absolute h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
            {/* Thumb */}
            <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/bar:opacity-100 transition-opacity -translate-x-1/2"
              style={{ left: `${progress}%` }} />
          </div>

          {/* Buttons row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button onClick={() => seek(-10)} className="text-white/70 hover:text-white transition p-1">
                <RotateCcw size={16} />
              </button>
              <button onClick={togglePlay} className="text-white hover:text-white/80 transition p-1">
                {playing ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
              </button>
              <button onClick={() => seek(10)} className="text-white/70 hover:text-white transition p-1">
                <RotateCw size={16} />
              </button>

              {/* Volume */}
              <button onClick={() => setMuted(p => !p)} className="text-white/70 hover:text-white transition p-1">
                {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume}
                onChange={e => { setVolume(+e.target.value); setMuted(false); }}
                className="w-16 accent-white h-1 cursor-pointer hidden sm:block" />

              <span className="text-white/60 text-xs font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Speed */}
              <div className="relative">
                <button onClick={() => setShowSpeed(p => !p)}
                  className="text-white/70 hover:text-white transition p-1 flex items-center gap-1 text-xs">
                  <Settings size={15} /> {speed}x
                </button>
                {showSpeed && (
                  <div className="absolute bottom-8 right-0 bg-neutral-900 border border-white/10 rounded-xl overflow-hidden z-10">
                    {SPEEDS.map(s => (
                      <button key={s} onClick={() => { setSpeed(s); setShowSpeed(false); }}
                        className={`block w-full px-4 py-2 text-xs text-left hover:bg-white/10 transition ${speed === s ? "text-cyan-400" : "text-white/70"}`}>
                        {s}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={toggleFullscreen} className="text-white/70 hover:text-white transition p-1">
                {fullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
