import type { ReactNode } from "react";
import type { Rect } from "../anim";
import { C, FONT, SPACE_COLORS } from "../theme";

// The harbor: every Space is a signboard standing on its own pier. ferry's boat runs between piers.

const CARD = { w: 320, h: 180, y: 290, spacing: 370 };
/** Where the sea starts behind the piers. */
export const HORIZON = 500;
/** The waterline boats float at; anything drawn below it in front is underwater. */
export const WATER = 650;
const DECK_Y = 560;

export const cardRect = (space: number): Rect => ({
  x: 960 + (space - 3) * CARD.spacing - CARD.w / 2,
  y: CARD.y,
  w: CARD.w,
  h: CARD.h,
});

/** Converts a rectangle on a Space's screen into harbor coordinates on that Space's card. */
export const onCard = (space: number, r: { x: number; y: number; w: number; h: number }) => {
  const c = cardRect(space);
  const k = CARD.w / 1920;
  return { x: c.x + r.x * k, y: c.y + r.y * k, w: r.w * k, h: r.h * k, k };
};

export const pierX = (space: number) => 960 + (space - 3) * CARD.spacing;

const Waves = ({ frame, from, rows, gap, speed = 1 }: { frame: number; from: number; rows: number; gap: number; speed?: number }) => (
  <>
    {Array.from({ length: rows }).map((_, row) => (
      <g key={row} opacity={0.22}>
        {Array.from({ length: 16 }).map((__, i) => (
          <rect
            key={i}
            x={((frame * speed * (1 + row * 0.3)) % 200) - 400 + i * 200 + (row % 2) * 100}
            y={from + row * gap}
            width={70}
            height={7}
            rx={3.5}
            fill={C.foam}
          />
        ))}
      </g>
    ))}
  </>
);

type Props = {
  frame: number;
  /** Draws a Space's screen in 1920×1080 coordinates. */
  screen: (space: number) => ReactNode;
  /** Drawn between the piers and the front water: boats and flying windows. */
  children?: ReactNode;
};

export const Harbor = ({ frame, screen, children }: Props) => (
  <g>
    <rect x={-3000} y={-3000} width={8000} height={8000} fill="#DCEEF6" />
    <rect x={-3000} y={HORIZON - 120} width={8000} height={120} fill="#E9F3F2" />
    <circle cx={1620} cy={170} r={80} fill="#FFE2A8" />
    {[
      [320, 130, 1],
      [1180, 90, 0.8],
    ].map(([cx, cy, s], i) => (
      <g key={i} fill={C.white} transform={`translate(${cx + ((frame * 0.3) % 80)} ${cy}) scale(${s})`}>
        <circle cx={0} cy={0} r={34} />
        <circle cx={40} cy={10} r={26} />
        <circle cx={-38} cy={12} r={22} />
      </g>
    ))}
    {/* far shore */}
    <path d="M -300 500 Q 200 430 600 470 T 1300 460 T 2200 480 V 510 H -300 Z" fill="#B9D6CF" />
    <rect x={-3000} y={HORIZON} width={8000} height={3000} fill={C.sea} />
    <Waves frame={frame} from={HORIZON + 26} rows={3} gap={40} speed={0.6} />

    {[1, 2, 3, 4, 5].map((s) => {
      const r = cardRect(s);
      const px = pierX(s);
      return (
        <g key={s}>
          {/* posts, planks, sign */}
          {[-130, -45, 45, 130].map((dx) => (
            <rect key={dx} x={px + dx - 10} y={DECK_Y + 10} width={20} height={WATER + 10 - DECK_Y} rx={4} fill="#6E4A33" />
          ))}
          <rect x={px - 160} y={DECK_Y} width={320} height={24} rx={6} fill="#A87552" />
          <rect x={px - 160} y={DECK_Y + 18} width={320} height={8} fill="#8A5E41" />
          <circle cx={px + 138} cy={DECK_Y - 12} r={12} fill={C.navyInk} />
          {[-110, 110].map((dx) => (
            <rect key={dx} x={px + dx - 7} y={r.y + r.h} width={14} height={DECK_Y - r.y - r.h} fill={C.navyInk} />
          ))}
          <rect x={r.x - 10} y={r.y - 10} width={r.w + 20} height={r.h + 20} rx={16} fill={C.navyInk} />
          <svg x={r.x} y={r.y} width={r.w} height={r.h} viewBox="0 0 1920 1080" overflow="hidden">
            {screen(s)}
          </svg>
          <rect x={px - 64} y={DECK_Y - 46} width={128} height={38} rx={12} fill={SPACE_COLORS[s].deep} />
          <text x={px} y={DECK_Y - 19} textAnchor="middle" fontFamily={FONT.ui} fontWeight={700} fontSize={22} fill={C.navyInk}>
            Space {s}
          </text>
        </g>
      );
    })}
    {children}
    {/* front water hides hulls and posts below the waterline */}
    <path
      d={`M -3000 ${WATER} ${Array.from({ length: 60 }, (_, i) => `L ${-400 + i * 50} ${WATER + Math.sin(i * 0.9 + frame / 10) * 5}`).join(" ")} L 5000 ${WATER} V 3000 H -3000 Z`}
      fill={C.sea}
    />
    {/* broken reflections of each Space's wallpaper */}
    {[1, 2, 3, 4, 5].map((s) => (
      <g key={s} opacity={0.3}>
        {Array.from({ length: 8 }).map((_, i) => {
          const w = CARD.w * (1 - i * 0.09);
          return (
            <rect
              key={i}
              x={pierX(s) - w / 2 + Math.sin(frame / 14 + i * 1.3 + s) * 14}
              y={WATER + 24 + i * 26}
              width={w}
              height={12}
              rx={6}
              fill={SPACE_COLORS[s].wall}
            />
          );
        })}
      </g>
    ))}
    <Waves frame={frame} from={WATER + 40} rows={6} gap={70} />
  </g>
);
