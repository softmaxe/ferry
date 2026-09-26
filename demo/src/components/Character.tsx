import type { ReactElement } from "react";
import { C } from "../theme";

// A seated, gender-neutral figure in profile facing right. (0, 0) is the middle of the seat.

export type Mouth = "neutral" | "smile" | "grin" | "sigh" | "o";

type Point = { x: number; y: number };

const UPPER = 108;
const LOWER = 104;

/** Two-bone IK: the elbow for a shoulder reaching toward a hand target, bending downward. */
const elbowFor = (s: Point, t: Point, bendDown = true): { elbow: Point; hand: Point } => {
  const dx = t.x - s.x;
  const dy = t.y - s.y;
  const reach = Math.min(Math.hypot(dx, dy), UPPER + LOWER - 0.5);
  const base = Math.atan2(dy, dx);
  const hand = { x: s.x + Math.cos(base) * reach, y: s.y + Math.sin(base) * reach };
  const cosA = (UPPER * UPPER + reach * reach - LOWER * LOWER) / (2 * UPPER * reach);
  const a = Math.acos(Math.max(-1, Math.min(1, cosA))) * (bendDown ? 1 : -1);
  return { elbow: { x: s.x + Math.cos(base + a) * UPPER, y: s.y + Math.sin(base + a) * UPPER }, hand };
};

type Props = {
  x: number;
  y: number;
  scale?: number;
  /** Degrees the upper body leans back (negative leans toward the screen). */
  lean?: number;
  /** Hand targets in character coordinates (before lean). */
  front: Point;
  back: Point;
  mouth?: Mouth;
  /** 0 open, 1 closed. */
  blink?: number;
  /** Head tilt in degrees. */
  nod?: number;
  headset?: boolean;
  sweat?: number;
  holding?: "cup" | null;
  frontBendUp?: boolean;
};

const MOUTHS: Record<Mouth, ReactElement> = {
  neutral: <path d="M 36 -228 Q 44 -224 52 -229" stroke={C.navyInk} strokeWidth={5} fill="none" strokeLinecap="round" />,
  smile: <path d="M 30 -232 Q 44 -218 56 -234" stroke={C.navyInk} strokeWidth={5} fill="none" strokeLinecap="round" />,
  grin: <path d="M 28 -234 Q 44 -212 58 -236 Z" fill={C.navyInk} />,
  sigh: <path d="M 34 -224 Q 44 -232 54 -224" stroke={C.navyInk} strokeWidth={5} fill="none" strokeLinecap="round" />,
  o: <ellipse cx={46} cy={-227} rx={7} ry={9} fill={C.navyInk} />,
};

export const Character = ({
  x,
  y,
  scale = 1,
  lean = 0,
  front,
  back,
  mouth = "neutral",
  blink = 0,
  nod = 0,
  headset = false,
  sweat = 0,
  holding = null,
  frontBendUp = false,
}: Props) => {
  const shoulderFront = { x: 6, y: -172 };
  const shoulderBack = { x: -14, y: -176 };
  const armBack = elbowFor(shoulderBack, back);
  const armFront = elbowFor(shoulderFront, front, !frontBendUp);
  const eyeScale = 1 - Math.min(1, Math.max(0, blink)) * 0.9;

  const arm = (a: { elbow: Point; hand: Point }, s: Point, shade: string) => (
    <g>
      <polyline
        points={`${s.x},${s.y} ${a.elbow.x},${a.elbow.y} ${a.hand.x},${a.hand.y}`}
        fill="none"
        stroke={shade}
        strokeWidth={34}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={a.hand.x} cy={a.hand.y} r={17} fill={C.skin} />
    </g>
  );

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* chair */}
      <rect x={-150} y={-250} width={30} height={262} rx={15} fill={C.navyDeep} />
      <rect x={-150} y={-6} width={220} height={26} rx={13} fill={C.navyDeep} />
      <rect x={-52} y={18} width={20} height={150} fill={C.navyDeep} />
      <rect x={-110} y={160} width={140} height={16} rx={8} fill={C.navyDeep} />

      {/* legs */}
      <path d="M -70 -10 H 110 Q 130 -10 130 12 V 150 H 92 V 30 H -70 Z" fill={C.navy} />
      <rect x={82} y={140} width={78} height={30} rx={15} fill={C.navyInk} />

      <g transform={`rotate(${-lean} -20 -10)`}>
        {arm(armBack, shoulderBack, C.coralDeep)}
        {/* torso */}
        <path d="M -78 -8 Q -86 -150 -52 -190 Q -20 -212 18 -206 Q 52 -198 58 -150 L 62 -8 Z" fill={C.coral} />
        <path d="M -8 -200 Q 10 -214 30 -204 L 22 -188 Q 8 -196 -4 -190 Z" fill={C.cream} />
        {/* neck + head */}
        <g transform={`rotate(${nod} 0 -200)`}>
          <rect x={-18} y={-222} width={36} height={30} rx={10} fill={C.skinShade} />
          <circle cx={0} cy={-268} r={64} fill={C.skin} />
          <circle cx={60} cy={-252} r={11} fill={C.skin} />
          <path
            d="M -64 -262 Q -70 -330 -4 -338 Q 52 -342 62 -300 Q 30 -312 14 -290 Q 4 -310 -22 -296 Q -34 -280 -38 -236 Q -60 -230 -64 -262 Z"
            fill={C.hair}
          />
          <circle cx={-14} cy={-262} r={13} fill={C.skinShade} />
          <ellipse cx={32} cy={-268} rx={6.5} ry={9 * eyeScale} fill={C.navyInk} />
          <circle cx={22} cy={-244} r={11} fill={C.coral} opacity={0.35} />
          {MOUTHS[mouth]}
          {headset && (
            <g>
              <path d="M -52 -300 Q -4 -360 50 -304" stroke={C.navyInk} strokeWidth={12} fill="none" strokeLinecap="round" />
              <rect x={-30} y={-290} width={30} height={46} rx={12} fill={C.navyInk} />
              <path d="M -10 -250 Q 10 -214 44 -222" stroke={C.navyInk} strokeWidth={6} fill="none" strokeLinecap="round" />
              <circle cx={46} cy={-222} r={7} fill={C.coral} />
            </g>
          )}
          {sweat > 0 && (
            <path
              d="M 70 -310 Q 80 -290 70 -284 Q 60 -290 70 -310 Z"
              fill={C.seaLight}
              opacity={sweat}
              transform={`translate(0 ${(1 - sweat) * -10})`}
            />
          )}
        </g>
        {arm(armFront, shoulderFront, C.coral)}
        {holding === "cup" && (
          <g transform={`translate(${armFront.hand.x + 6} ${armFront.hand.y - 30})`}>
            <path d="M 21 10 Q 38 12 34 26 Q 30 36 18 34" stroke={C.navyInk} strokeWidth={7} fill="none" />
            <path d="M -20 0 H 22 L 18 44 Q 16 52 8 52 H -6 Q -14 52 -16 44 Z" fill={C.white} stroke={C.navyInk} strokeWidth={4} />
            <rect x={-19} y={14} width={40} height={12} fill={C.navy} />
          </g>
        )}
      </g>
    </g>
  );
};
