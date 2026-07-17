interface SectionWaveProps {
  from: string;
  to: string;
  className?: string;
}

export function SectionWave({
  from,
  to,
  className = "h-16 md:h-26",
}: SectionWaveProps) {
  return (
    <div
      aria-hidden="true"
      className={`relative w-full overflow-hidden ${className}`}
      style={{ backgroundColor: from }}
    >
      <div className="wave-flow absolute inset-0">
        <svg
          className="h-full w-[220%]"
          viewBox="0 0 2880 120"
          preserveAspectRatio="none"
        >
          <path
            d="
              M0 60
              C120 20 240 20 360 60
              S600 100 720 60
              S960 20 1080 60
              S1320 100 1440 60
              S1680 20 1800 60
              S2040 100 2160 60
              S2400 20 2520 60
              S2760 100 2880 60
              L2880 120
              L0 120
              Z
            "
            fill={to}
          />
        </svg>
      </div>
    </div>
  );
}