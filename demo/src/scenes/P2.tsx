import { bob, cueProgress, ease, keys } from "../anim";
import { Boat, Wake } from "../components/Boat";
import { C, FONT } from "../theme";
import { cueFrame, eighths } from "../timeline";
import type { SceneProps } from "./types";

// Title: the ferry sails in, the name rises, the tagline lands on three beats.

const HORIZON = 640;

export const Sea = ({ frame, horizon = HORIZON, color = C.navy, fill = true }: { frame: number; horizon?: number; color?: string; fill?: boolean }) => (
  <g>
    {fill && <rect x={-200} y={horizon} width={2320} height={1200} fill={color} />}
    {Array.from({ length: 7 }).map((_, row) => {
      const y = horizon + 40 + row * 62;
      const shift = ((frame * (1.2 + row * 0.25)) % 240) - 240;
      return (
        <g key={row} opacity={0.18 + row * 0.03}>
          {Array.from({ length: 11 }).map((__, i) => (
            <rect key={i} x={shift + i * 240 + (row % 2) * 120} y={y} width={90 + (row % 3) * 20} height={8} rx={4} fill={C.cream} />
          ))}
        </g>
      );
    })}
  </g>
);

export const P2 = ({ frame: f, text }: SceneProps) => {
  const enter = cueFrame("p2.boatEnter");
  const leave = cueFrame("p2.tagline3") + eighths(3);
  const x = keys(f, [[enter, -500], [cueFrame("p2.wordmark"), 960], [leave, 960], [leave + eighths(3), 2500]], ease.out);
  const moving = f < cueFrame("p2.wordmark") ? 1 - cueProgress(f, "p2.boatEnter", 6, ease.out) : f > leave ? 1 : 0;
  const b = bob(f, 7, 120);
  const word = cueProgress(f, "p2.wordmark", 3, ease.out);
  const sun = cueProgress(f, "p2.boatEnter", 12, ease.soft);

  const parts = text.tagline;
  const cues = ["p2.tagline1", "p2.tagline2", "p2.tagline3"];
  const zh = /[一-鿿]/.test(parts.join(""));

  return (
    <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
      <rect width={1920} height={1080} fill={C.cream} />
      <circle cx={1500} cy={HORIZON + 40 - sun * 170} r={120} fill={C.coral} opacity={0.9} />
      <Sea frame={f} />
      <Wake x={x - 170} y={HORIZON + 8} length={380} frame={f} opacity={Math.min(1, moving * 2)} />
      <Boat x={x} y={HORIZON + 40 + b.y} rotate={b.r} scale={0.62} speed={Math.min(1, moving * 1.6)} />
      <path
        d={`M -100 ${HORIZON + 14} ${Array.from({ length: 50 }, (_, i) => `L ${-100 + i * 45} ${HORIZON + 14 + Math.sin(i * 0.8 + f / 9) * 5}`).join(" ")} V 1200 H -100 Z`}
        fill={C.navy}
      />
      <Sea frame={f} fill={false} />

      <g opacity={word} transform={`translate(0 ${(1 - word) * 40})`}>
        <text x={960} y={250} textAnchor="middle" fontFamily={FONT.display} fontWeight={600} fontSize={190} fill={C.navy} letterSpacing={-4}>
          ferry
        </text>
      </g>

      <text x={960} y={900} textAnchor="middle" fontFamily={FONT.display} fontWeight={600} fontSize={zh ? 76 : 80}>
        {parts.map((part, i) => {
          const p = cueProgress(f, cues[i], 2, ease.out);
          return (
            <tspan key={i} fill={i === 2 ? C.coral : C.cream} fillOpacity={p}>
              {part}
              {!zh && i < 2 ? " " : ""}
            </tspan>
          );
        })}
      </text>
    </svg>
  );
};
