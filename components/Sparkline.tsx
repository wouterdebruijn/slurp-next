import { type CSSProperties, useMemo } from "react";

type Point = { x: number; y: number };

function buildPath(points: Point[]) {
  if (points.length === 0) return "";
  const [first, ...rest] = points;
  return rest.reduce(
    (d, p) => `${d} L ${p.x} ${p.y}`,
    `M ${first.x} ${first.y}`
  );
}

export default function Sparkline({
  values,
  className,
  style,
}: {
  values: number[];
  className?: string;
  style?: CSSProperties;
}) {
  const { path, min, max } = useMemo(() => {
    const safe = values.length ? values : [0];
    const minVal = Math.min(...safe);
    const maxVal = Math.max(...safe);

    const width = 240;
    const height = 64;
    const padding = 6;

    const span = Math.max(1e-6, maxVal - minVal);

    const pts: Point[] = safe.map((v, i) => {
      const t = safe.length === 1 ? 0.5 : i / (safe.length - 1);
      const x = padding + t * (width - padding * 2);
      const y = padding + (1 - (v - minVal) / span) * (height - padding * 2);
      return { x, y };
    });

    return { path: buildPath(pts), min: minVal, max: maxVal };
  }, [values]);

  return (
    <div className={className} style={style}>
      <svg
        viewBox="0 0 240 64"
        width="100%"
        height="64"
        aria-label="Shots graph"
        role="img"
      >
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="text-yellow-400"
        />
      </svg>
      <div className="mt-1 flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
        <span>{min.toFixed(1)}</span>
        <span>{max.toFixed(1)}</span>
      </div>
    </div>
  );
}
