import { C, FONT } from "../theme";
import { Boat } from "./Boat";

/** Keycaps shown while a shortcut is pressed. `appear` pops them in; `press` 0→1→0 pushes them down. */
export const Keycaps = ({ keys, appear, press, x = 960, y = 820, size = 96 }: {
  keys: string[];
  appear: number;
  press: number;
  x?: number;
  y?: number;
  size?: number;
}) => {
  if (appear <= 0.001) return null;
  const gap = 18;
  const widths = keys.map((k) => (k.length > 2 ? size * 2.1 : size));
  const total = widths.reduce((a, b) => a + b, 0) + gap * (keys.length - 1);
  let cursor = x - total / 2;
  const depth = 10;
  return (
    <g opacity={Math.min(1, appear * 1.5)} transform={`translate(${x} ${y}) scale(${0.7 + 0.3 * appear}) translate(${-x} ${-y})`}>
      {keys.map((k, i) => {
        const w = widths[i];
        const kx = cursor;
        cursor += w + gap;
        const dy = press * (depth - 2);
        return (
          <g key={i}>
            <rect x={kx} y={y - size / 2 + depth} width={w} height={size} rx={20} fill={C.navyDeep} />
            <rect x={kx} y={y - size / 2 + dy} width={w} height={size} rx={20} fill={C.cream} />
            <rect x={kx + 8} y={y - size / 2 + dy + 6} width={w - 16} height={size - 20} rx={15} fill={C.paper} />
            <text
              x={kx + w / 2}
              y={y + dy + size * 0.13}
              textAnchor="middle"
              fontFamily={FONT.ui}
              fontWeight={600}
              fontSize={k.length > 2 ? size * 0.3 : size * 0.42}
              fill={C.navyInk}
            >
              {k}
            </text>
          </g>
        );
      })}
    </g>
  );
};

/** A navy pill with one line of copy, centered under the menu bar. */
export const Caption = ({ text, show, y = 118, size = 40, mono = false }: { text: string; show: number; y?: number; size?: number; mono?: boolean }) => {
  if (show <= 0.001) return null;
  const est = [...text].reduce((w, ch) => w + (ch.charCodeAt(0) > 0x2e80 ? size : size * (mono ? 0.6 : 0.52)), 0);
  const w = est + 80;
  return (
    <g opacity={show} transform={`translate(0 ${(1 - show) * 16})`}>
      <rect x={960 - w / 2} y={y - size * 0.95} width={w} height={size * 1.9} rx={size * 0.95} fill={C.navyInk} opacity={0.92} />
      <text x={960} y={y + size * 0.35} textAnchor="middle" fontFamily={mono ? FONT.mono : FONT.ui} fontWeight={600} fontSize={size} fill={C.cream}>
        {text}
      </text>
    </g>
  );
};

export const ClockChip = ({ time, show }: { time: string; show: number }) => {
  if (show <= 0.001) return null;
  const hour = parseInt(time, 10);
  const day = hour >= 6 && hour < 18;
  return (
    <g opacity={show}>
      <rect x={48} y={44} width={196} height={64} rx={32} fill={C.navyInk} opacity={0.9} />
      {day ? (
        <g>
          <circle cx={90} cy={76} r={13} fill="#FFD27A" />
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={i} x1={90} y1={56} x2={90} y2={52} stroke="#FFD27A" strokeWidth={4} strokeLinecap="round" transform={`rotate(${i * 45} 90 76)`} />
          ))}
        </g>
      ) : (
        <path d="M 96 58 A 18 18 0 1 0 104 88 A 14 14 0 1 1 96 58 Z" fill="#FFD27A" />
      )}
      <text x={126} y={88} fontFamily={FONT.mono} fontWeight={700} fontSize={32} fill={C.cream}>
        {time}
      </text>
    </g>
  );
};

/**
 * A wave that sweeps left to right across the frame with the ferry riding its crest.
 * 0..0.5 covers the old shot, 0.5..1 uncovers the new one.
 */
export const WaveWipe = ({ t, frame }: { t: number; frame: number }) => {
  if (t <= 0 || t >= 1) return null;
  const width = 1920 * 1.5;
  const x = -width + t * (1920 + width);
  const lead = x + width;
  const edge = (offset: number, amp: number, phase: number) => {
    const pts: string[] = [];
    for (let yy = -40; yy <= 1120; yy += 40) {
      pts.push(`${offset + Math.sin(yy / 90 + frame / 6 + phase) * amp},${yy}`);
    }
    return pts;
  };
  const band = (left: number, right: number, amp: number, fill: string) => {
    const r = edge(right, amp, 0);
    const l = edge(left, amp, 2).reverse();
    return <path d={`M ${[...r, ...l].join(" L ")} Z`} fill={fill} />;
  };
  return (
    <g>
      {band(x, lead, 26, C.seaLight)}
      {band(x + 60, lead - 70, 22, C.sea)}
      {band(x + 140, lead - 150, 18, C.navy)}
      <Boat x={lead - 60} y={600 + Math.sin(frame / 8) * 10} scale={0.42} rotate={-4} speed={1} />
    </g>
  );
};
