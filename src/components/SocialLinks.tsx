export interface SiteSettings {
  instagramUrl?: string | null;
  instagramUrl2?: string | null;
  linkedinUrl?: string | null;
  youtubeUrl?: string | null;
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M4.98 3.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-.98 1.83-2 3.77-2 4.03 0 4.78 2.5 4.78 5.76V21h-4v-5.8c0-1.38-.03-3.15-2.02-3.15-2.02 0-2.33 1.5-2.33 3.05V21h-4V9Z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <rect x="2" y="5.5" width="20" height="13" rx="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M10.5 9.5v5l4.5-2.5-4.5-2.5Z" fill="currentColor" />
    </svg>
  );
}

/** Icon-only social links; renders nothing for any URL left blank. */
export function SocialLinks({
  settings,
  className = "",
  showLabel = false,
}: {
  settings: SiteSettings;
  className?: string;
  showLabel?: boolean;
}) {
  const links = [
    { url: settings.instagramUrl, label: "Instagram", Icon: InstagramIcon },
    { url: settings.instagramUrl2, label: "Instagram (2)", Icon: InstagramIcon },
    { url: settings.linkedinUrl, label: "LinkedIn", Icon: LinkedInIcon },
    { url: settings.youtubeUrl, label: "YouTube", Icon: YouTubeIcon },
  ].filter((l) => l.url);

  if (links.length === 0) return null;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showLabel && <span className="text-xs font-semibold uppercase tracking-[0.16em] opacity-70">Follow us</span>}
      {links.map(({ url, label, Icon }) => (
        <a
          key={label}
          href={url!}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={label}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-current/20 opacity-80 transition hover:opacity-100"
        >
          <Icon />
        </a>
      ))}
    </div>
  );
}
