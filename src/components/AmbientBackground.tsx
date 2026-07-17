interface AmbientBackgroundProps {
  tone?: "light" | "dark";
  noise?: boolean;
}

const BLOBS: Record<"light" | "dark", { cls: string; pos: string; size: string; color: string }[]> = {
  light: [
    { cls: "blob-a", pos: "-left-32 top-20", size: "h-[420px] w-[420px]", color: "bg-primary/20" },
    { cls: "blob-b", pos: "right-[-120px] top-40", size: "h-[520px] w-[520px]", color: "bg-accent/40" },
    { cls: "blob-a", pos: "bottom-[-80px] left-1/3", size: "h-[380px] w-[380px]", color: "bg-sand/60" },
  ],
  dark: [
    { cls: "blob-a", pos: "-left-32 top-10", size: "h-[400px] w-[400px]", color: "bg-accent/30" },
    { cls: "blob-b", pos: "right-[-100px] bottom-[-80px]", size: "h-[500px] w-[500px]", color: "bg-background/10" },
    { cls: "blob-a", pos: "bottom-[-40px] left-1/4", size: "h-[360px] w-[360px]", color: "bg-primary/20" },
  ],
};

/** Reusable layered ambient backdrop: blurred gradient blobs + optional noise overlay. */
export function AmbientBackground({ tone = "light", noise = true }: AmbientBackgroundProps) {
  const blobs = BLOBS[tone];

  return (
    <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
      {blobs.map((b, i) => (
        <div key={i} className={`${b.cls} absolute ${b.pos} ${b.size} rounded-full ${b.color} blur-3xl`} />
      ))}
      {noise && <div className="noise-overlay" />}
    </div>
  );
}
