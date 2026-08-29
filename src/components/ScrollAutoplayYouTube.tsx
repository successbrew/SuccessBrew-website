"use client";

import { useEffect, useRef, useState } from "react";

const YOUTUBE_ORIGIN = "https://www.youtube.com";

/**
 * Embedded YouTube video that plays while its section is in view and pauses
 * once the user scrolls it out. YouTube's own chrome (title bar, "Watch on
 * YouTube" bug, progress bar, volume, share, fullscreen — everything) is
 * disabled via `controls=0`, since that chrome is drawn inside YouTube's
 * cross-origin iframe and can't be shown/hidden on our own hover timing.
 * In its place, a single custom mute/unmute button is overlaid on our side —
 * the one control worth keeping for a background autoplay video — visible
 * only while the pointer is over the player. Captions stay off via
 * cc_load_policy=0.
 *
 * Browsers only allow autoplay-with-sound after a user gesture (a click/tap
 * on the page), which this video never gets on first load. The one exception
 * every major browser grants is: autoplay muted (always allowed), then call
 * unMute() once playback has actually started — no gesture required for
 * that follow-up call. So it starts muted per the embed's `mute=1` param and
 * we unmute a beat after `playVideo` fires. Chrome/Edge honor this
 * consistently; Safari/Firefox are stricter and may keep it muted until the
 * visitor has interacted with the page at all — there's no code-only way
 * around that, it's a platform policy, not a bug.
 */
export function ScrollAutoplayYouTube({
  videoId,
  title,
  className,
}: {
  videoId: string;
  title: string;
  className?: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isVisibleRef = useRef(false);
  const readyRef = useRef(false);
  const [muted, setMuted] = useState(true);

  function postCommand(func: "playVideo" | "pauseVideo" | "mute" | "unMute", args: unknown[] = []) {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args }), YOUTUBE_ORIGIN);
  }

  function play() {
    postCommand("playVideo");
    // Give playback a moment to actually start before lifting mute — Chrome
    // allows this without a gesture only once the media is already playing.
    setTimeout(() => {
      postCommand("unMute");
      setMuted(false);
    }, 400);
  }

  function toggleMute() {
    if (muted) {
      postCommand("unMute");
      setMuted(false);
    } else {
      postCommand("mute");
      setMuted(true);
    }
  }

  useEffect(() => {
    const el = iframeRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (!readyRef.current) return;
        if (entry.isIntersecting) play();
        else postCommand("pauseVideo");
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`group relative ${className ?? ""}`}>
      <iframe
        ref={iframeRef}
        className="absolute inset-0 h-full w-full border-0"
        src={`${YOUTUBE_ORIGIN}/embed/${videoId}?enablejsapi=1&mute=1&loop=1&playlist=${videoId}&playsinline=1&rel=0&iv_load_policy=3&cc_load_policy=0&controls=0&modestbranding=1&disablekb=1`}
        title={title}
        allow="autoplay; encrypted-media"
        onLoad={() => {
          readyRef.current = true;
          if (isVisibleRef.current) play();
        }}
      />
      {/* Blocks clicks from reaching YouTube's own (now-hidden) UI/link-outs — this is meant to be a clean background video, not a launchpad to YouTube. */}
      <div className="absolute inset-0" />
      <button
        type="button"
        onClick={toggleMute}
        aria-label={muted ? "Unmute video" : "Mute video"}
        className="absolute bottom-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100"
      >
        {muted ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        )}
      </button>
    </div>
  );
}
