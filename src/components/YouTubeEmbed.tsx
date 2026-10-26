"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";

/**
 * Standard YouTube embed with YouTube's own player chrome: title bar, play/pause,
 * progress bar, volume/mute, settings and fullscreen. Nothing autoplays; the
 * visitor starts and controls playback just like on youtube.com.
 *
 * With `poster`, the video's full-resolution thumbnail and a play button are
 * shown until the visitor clicks, then the player loads and starts playing.
 */
export function YouTubeEmbed({
  videoId,
  title,
  className,
  poster = false,
}: {
  videoId: string;
  title: string;
  className?: string;
  poster?: boolean;
}) {
  const [playing, setPlaying] = useState(!poster);

  return (
    <div className={`relative ${className ?? ""}`}>
      {playing ? (
        <iframe
          className="absolute inset-0 h-full w-full border-0"
          src={`https://www.youtube.com/embed/${videoId}?rel=0&playsinline=1${poster ? "&autoplay=1" : ""}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play video: ${title}`}
          className="group absolute inset-0 h-full w-full cursor-pointer"
        >
          <img
            src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`}
            alt=""
            className="h-full w-full object-cover"
          />
          <span className="absolute inset-0 bg-ink/10 transition-colors duration-300 group-hover:bg-ink/20" />
          <span className="glow-blue absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gradient-to-r from-primary to-[#1F55E8] text-white transition-transform duration-300 group-hover:scale-105 md:h-24 md:w-24">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="ml-1"><path d="M8 5.5v13l11-6.5-11-6.5z" /></svg>
          </span>
        </button>
      )}
    </div>
  );
}
