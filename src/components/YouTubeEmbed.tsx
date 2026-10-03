/**
 * Standard YouTube embed with YouTube's own player chrome: title bar, play/pause,
 * progress bar, volume/mute, settings and fullscreen. Nothing autoplays; the
 * visitor starts and controls playback just like on youtube.com.
 */
export function YouTubeEmbed({
  videoId,
  title,
  className,
}: {
  videoId: string;
  title: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <iframe
        className="absolute inset-0 h-full w-full border-0"
        src={`https://www.youtube.com/embed/${videoId}?rel=0&playsinline=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}
