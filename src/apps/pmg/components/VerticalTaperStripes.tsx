import { useEffect, useMemo, useRef, useState } from 'react';

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

type VerticalTaperStripesProps = {
  minWidth?: number;
  maxWidth?: number;
  stripePitch?: number;
  color?: string;
  className?: string;
};

export function VerticalTaperStripes({
  minWidth = 4,
  maxWidth = 14,
  stripePitch = 18,
  color = 'var(--gs-accent-500)',
  className,
}: VerticalTaperStripesProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;
      setContainerWidth(entry.contentRect.width);
    });
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  const h = 100;
  const leftPad = stripePitch; // buffer so we never end short
  const viewBoxWidth = Math.max(1, containerWidth + leftPad * 2);
  const xMin = -leftPad;

  const polys = useMemo(() => {
    const w = containerWidth;
    if (w <= 0) return [];

    const total = w + leftPad * 2;
    const n = Math.max(2, Math.ceil(total / stripePitch) + 2);

    return Array.from({ length: n }, (_, i) => {
      const t = i / (n - 1);
      const topW = lerp(maxWidth, minWidth, t);
      const bottomW = lerp(minWidth, maxWidth, t);
      const cx = xMin + i * stripePitch;

      const x0 = cx - topW / 2;
      const x1 = cx + topW / 2;
      const x2 = cx + bottomW / 2;
      const x3 = cx - bottomW / 2;

      return { key: i, points: `${x0},0 ${x1},0 ${x2},${h} ${x3},${h}` };
    });
  }, [containerWidth, leftPad, maxWidth, minWidth, stripePitch, xMin]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden w-full h-full ${className ?? ''}`}>
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`${xMin} 0 ${viewBoxWidth} ${h}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
        shapeRendering="geometricPrecision"
      >
        {polys.map(p => (
          <polygon key={p.key} points={p.points} fill={color} />
        ))}
      </svg>
    </div>
  );
}

