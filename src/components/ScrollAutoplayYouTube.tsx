"use client";

import { useEffect, useRef } from "react";

const YOUTUBE_ORIGIN = "https://www.youtube.com";

/**
 * Embedded YouTube video that plays while its section is in view and pauses
 * once the user scrolls it out. Native controls (pause, share, watch-on-
 * YouTube, fullscreen) stay active for the visitor; only autoplay/pause is
 * driven by scroll position. Captions are forced off via cc_load_policy=0.
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

  function postCommand(func: "playVideo" | "pauseVideo" | "unMute", args: unknown[] = []) {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args }), YOUTUBE_ORIGIN);
  }

  function play() {
    postCommand("playVideo");
    // Give playback a moment to actually start before lifting mute — Chrome
    // allows this without a gesture only once the media is already playing.
    setTimeout(() => postCommand("unMute"), 400);
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
    <iframe
      ref={iframeRef}
      className={className}
      src={`${YOUTUBE_ORIGIN}/embed/${videoId}?enablejsapi=1&mute=1&loop=1&playlist=${videoId}&playsinline=1&rel=0&iv_load_policy=3&cc_load_policy=0`}
      title={title}
      allow="autoplay; encrypted-media"
      allowFullScreen
      onLoad={() => {
        readyRef.current = true;
        if (isVisibleRef.current) play();
      }}
    />
  );
}
