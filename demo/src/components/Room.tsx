import type { ReactNode } from "react";
import { C } from "../theme";
import type { Rect } from "../anim";
import { Boat } from "./Boat";

export type RoomKind = "cafe" | "office" | "dusk" | "sunset";

/** Where the laptop's display sits in room coordinates; the camera zooms to exactly this. */
export const SCREEN: Rect = { x: 880, y: 362, w: 576, h: 324 };

const WALL: Record<RoomKind, string> = {
  cafe: "#F8EEDF",
  office: "#E6EEF0",
  dusk: "#EAD9E6",
  sunset: "#F3DCCB",
};
const FLOOR: Record<RoomKind, string> = {
  cafe: "#D9B892",
  office: "#B9C7CF",
  dusk: "#B7A2BC",
  sunset: "#D2A88E",
};

const WIN = { x: 120, y: 150, w: 470, h: 430 };

const Sky = ({ kind, frame, sail }: { kind: RoomKind; frame: number; sail: number }) => {
  const { x, y, w, h } = WIN;
  if (kind === "cafe") {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} fill="#CFE6F3" />
        <rect x={x} y={y + h * 0.62} width={w} height={h * 0.38} fill="#F7D9BE" />
        <circle cx={x + 110} cy={y + h * 0.6} r={46} fill="#FFE7B8" />
        {/* street trees */}
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${x + 80 + i * 160} ${y + h})`}>
            <rect x={-8} y={-110} width={16} height={110} fill="#8C6A4E" />
            <circle cx={0} cy={-140} r={58} fill={i % 2 ? "#7FB89A" : "#93C7A8"} />
          </g>
        ))}
      </g>
    );
  }
  if (kind === "office") {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} fill="#A9D4EE" />
        {[
          [60, 90, 70],
          [290, 60, 90],
        ].map(([cx, cy, r], i) => (
          <g key={i} fill={C.white} opacity={0.9} transform={`translate(${((frame * 0.15) % 60) - 30} 0)`}>
            <circle cx={x + cx} cy={y + cy} r={r * 0.45} />
            <circle cx={x + cx + r * 0.45} cy={y + cy + 8} r={r * 0.35} />
            <circle cx={x + cx - r * 0.45} cy={y + cy + 12} r={r * 0.3} />
          </g>
        ))}
        {[
          [0, 190, 80],
          [80, 260, 70],
          [150, 160, 90],
          [240, 230, 60],
          [300, 200, 80],
          [380, 280, 90],
        ].map(([bx, bh, bw], i) => (
          <g key={i}>
            <rect x={x + bx} y={y + h - bh} width={bw} height={bh} fill={i % 2 ? "#6E8FB0" : "#86A6C4"} />
            {Array.from({ length: Math.floor(bh / 40) }).map((_, r) => (
              <rect key={r} x={x + bx + 14} y={y + h - bh + 18 + r * 40} width={bw - 28} height={10} rx={3} fill="#D7E7F2" opacity={0.6} />
            ))}
          </g>
        ))}
      </g>
    );
  }
  const dusk = kind === "dusk";
  const horizon = y + h * 0.6;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={dusk ? "#8E7BB5" : "#F2A477"} />
      <rect x={x} y={y + h * 0.25} width={w} height={h * 0.2} fill={dusk ? "#C48BB1" : "#F6BE84"} />
      <rect x={x} y={y + h * 0.45} width={w} height={h * 0.15} fill={dusk ? "#F0A98D" : "#FAD7A0"} />
      <circle cx={x + w * 0.62} cy={horizon} r={dusk ? 40 : 58} fill={dusk ? "#FFD3A8" : "#FFE2A8"} />
      <rect x={x} y={horizon} width={w} height={h - h * 0.6} fill={dusk ? "#4F5E93" : "#E5876A"} />
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={x + w * 0.62 - 60 + i * 12 + Math.sin(frame / 20 + i) * 8}
          y={horizon + 14 + i * 22}
          width={120 - i * 26}
          height={7}
          rx={3.5}
          fill={dusk ? "#FFD3A8" : "#FFE2A8"}
          opacity={0.7}
        />
      ))}
      {!dusk && <Boat x={x + 70 + sail * (w * 0.5)} y={horizon + 20} scale={0.09} speed={sail > 0 && sail < 1 ? 0.8 : 0} />}
    </g>
  );
};

const Decor = ({ kind, frame }: { kind: RoomKind; frame: number }) => {
  if (kind === "cafe") {
    return (
      <g>
        {/* pendant lamp */}
        <line x1={1150} y1={0} x2={1150} y2={150} stroke={C.navyInk} strokeWidth={4} />
        <path d="M 1090 200 Q 1090 150 1150 146 Q 1210 150 1210 200 Z" fill={C.navy} />
        <ellipse cx={1150} cy={204} rx={34} ry={8} fill="#FFE7B8" />
        {/* chalkboard */}
        <rect x={1560} y={170} width={260} height={320} rx={16} fill={C.navyInk} />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={1596} y={220 + i * 52} width={i === 0 ? 140 : 188 - (i % 2) * 50} height={12} rx={6} fill={C.cream} opacity={i === 0 ? 0.9 : 0.5} />
        ))}
        {/* plant */}
        <rect x={1640} y={630} width={90} height={82} rx={14} fill={C.coral} />
        {[-40, -10, 20, 45].map((a, i) => (
          <ellipse key={i} cx={1685} cy={600} rx={20} ry={62} fill="#6FAE8C" transform={`rotate(${a + Math.sin(frame / 40 + i) * 2} 1685 640)`} />
        ))}
      </g>
    );
  }
  if (kind === "office") {
    return (
      <g>
        <circle cx={1180} cy={190} r={68} fill={C.white} stroke={C.navy} strokeWidth={10} />
        <line x1={1180} y1={190} x2={1180} y2={140} stroke={C.navyInk} strokeWidth={8} strokeLinecap="round" />
        <line x1={1180} y1={190} x2={1216} y2={190} stroke={C.navyInk} strokeWidth={8} strokeLinecap="round" transform="rotate(-30 1180 190)" />
        <rect x={1590} y={150} width={250} height={562} fill="#C9D5DC" />
        {[0, 1, 2].map((r) => (
          <g key={r}>
            <rect x={1590} y={320 + r * 170} width={250} height={14} fill="#A9B8C1" />
            {[0, 1, 2, 3, 4].map((b) => (
              <rect
                key={b}
                x={1610 + b * 44}
                y={320 + r * 170 - (100 + ((b * 7 + r * 3) % 4) * 12)}
                width={34}
                height={100 + ((b * 7 + r * 3) % 4) * 12}
                rx={4}
                fill={[C.coral, C.navy, "#93CBAE", "#E6C56E", "#B7A7E3"][(b + r) % 5]}
              />
            ))}
          </g>
        ))}
      </g>
    );
  }
  return (
    <g>
      {/* picture frame */}
      <rect x={1600} y={200} width={220} height={170} rx={10} fill={C.cream} stroke={C.navy} strokeWidth={10} />
      <Boat x={1710} y={330} scale={0.14} speed={0.6} />
      {/* desk lamp */}
      <circle cx={1500} cy={560} r={210} fill="#FFE7B8" opacity={0.25} />
      <rect x={1470} y={700} width={80} height={14} rx={7} fill={C.navyInk} />
      <line x1={1510} y1={700} x2={1480} y2={600} stroke={C.navyInk} strokeWidth={10} strokeLinecap="round" />
      <line x1={1480} y1={600} x2={1540} y2={540} stroke={C.navyInk} strokeWidth={10} strokeLinecap="round" />
      <path d="M 1520 520 L 1600 560 L 1570 600 Z" fill={C.coral} />
    </g>
  );
};

type Props = {
  kind: RoomKind;
  frame: number;
  screen: ReactNode;
  /** 0 = lid open, 1 = closed. */
  lid?: number;
  cupOnDesk?: boolean;
  /** 0..1: how far the ferry outside the sunset window has sailed. */
  sail?: number;
  children?: ReactNode;
};

export const Room = ({ kind, frame, screen, lid = 0, cupOnDesk = false, sail = 0, children }: Props) => {
  const { x, y, w, h } = SCREEN;
  const lidScale = 1 - lid;
  return (
    <g>
      <rect x={-2000} y={-2000} width={6000} height={5000} fill={WALL[kind]} />
      <rect x={-2000} y={860} width={6000} height={2000} fill={FLOOR[kind]} />
      <rect x={WIN.x - 18} y={WIN.y - 18} width={WIN.w + 36} height={WIN.h + 36} rx={14} fill={C.cream} />
      <svg x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} viewBox={`${WIN.x} ${WIN.y} ${WIN.w} ${WIN.h}`}>
        <Sky kind={kind} frame={frame} sail={sail} />
      </svg>
      {/* the sunset room has one wide pane so the camera can look out through it */}
      {kind !== "sunset" && <rect x={WIN.x + WIN.w / 2 - 7} y={WIN.y} width={14} height={WIN.h} fill={C.cream} />}
      <rect x={WIN.x - 30} y={WIN.y + WIN.h + 10} width={WIN.w + 60} height={20} rx={10} fill={C.creamDeep} />
      <Decor kind={kind} frame={frame} />

      {/* desk */}
      <rect x={760} y={712} width={820} height={24} rx={12} fill="#9B6B4A" />
      <rect x={800} y={736} width={24} height={200} fill="#7F563B" />
      <rect x={1516} y={736} width={24} height={200} fill="#7F563B" />
      {cupOnDesk && (
        <g transform="translate(1566 660)">
          <path d="M 21 10 Q 38 12 34 26 Q 30 36 18 34" stroke={C.navyInk} strokeWidth={7} fill="none" />
          <path d="M -20 0 H 22 L 18 44 Q 16 52 8 52 H -6 Q -14 52 -16 44 Z" fill={C.white} stroke={C.navyInk} strokeWidth={4} />
          <rect x={-19} y={14} width={40} height={12} fill={C.navy} />
          {[0, 1].map((i) => (
            <path
              key={i}
              d={`M ${-6 + i * 14} -8 q -10 -14 0 -26 q 10 -12 0 -26`}
              stroke={C.white}
              strokeWidth={5}
              fill="none"
              strokeLinecap="round"
              opacity={0.5 + 0.3 * Math.sin(frame / 12 + i)}
            />
          ))}
        </g>
      )}

      {/* laptop */}
      <g transform={`translate(0 ${y + h + 16}) scale(1 ${lidScale}) translate(0 ${-(y + h + 16)})`}>
        <rect x={x - 16} y={y - 16} width={w + 32} height={h + 32} rx={20} fill={C.navyInk} />
        <svg x={x} y={y} width={w} height={h} viewBox="0 0 1920 1080" overflow="hidden">
          {screen}
        </svg>
      </g>
      <path d={`M ${x - 60} ${y + h + 16} H ${x + w + 60} L ${x + w + 80} 718 H ${x - 80} Z`} fill="#C3CAD4" />
      <rect x={x + w / 2 - 50} y={y + h + 16} width={100} height={6} rx={3} fill="#A7B0BD" />
      {children}
    </g>
  );
};
