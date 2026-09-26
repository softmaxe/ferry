import type { ReactNode } from "react";
import { C, FONT, SPACE_COLORS } from "../theme";

// A stylized macOS screen in 1920×1080 coordinates.

export const MENU_H = 44;

export const Wallpaper = ({ space, frame }: { space: number; frame: number }) => {
  const { wall, deep } = SPACE_COLORS[space];
  const drift = Math.sin(frame / 90) * 12;
  return (
    <g>
      <rect width={1920} height={1080} fill={wall} />
      <circle cx={1500 + drift} cy={330} r={210} fill={deep} opacity={0.35} />
      <path d={`M 0 820 Q 480 ${720 + drift} 960 800 T 1920 780 V 1080 H 0 Z`} fill={deep} opacity={0.45} />
      <path d={`M 0 900 Q 520 ${840 - drift} 1040 910 T 1920 880 V 1080 H 0 Z`} fill={deep} opacity={0.6} />
    </g>
  );
};

/** Five dots, one per Space; `current` is filled, `ping` pulses a Space that just received a window. */
export const SpaceDots = ({ x, y, current, ping = 0, pingSpace }: { x: number; y: number; current: number; ping?: number; pingSpace?: number }) => (
  <g>
    {[1, 2, 3, 4, 5].map((s) => {
      const cx = x + (s - 1) * 22;
      const on = s === current;
      return (
        <g key={s}>
          {pingSpace === s && ping > 0 && ping < 1 && (
            <circle cx={cx} cy={y} r={7 + ping * 16} fill="none" stroke={C.coral} strokeWidth={3} opacity={1 - ping} />
          )}
          <circle cx={cx} cy={y} r={on ? 7 : 5} fill={on ? C.navyInk : "#fff"} opacity={on ? 1 : 0.8} stroke={on ? "none" : C.navyInk} strokeWidth={on ? 0 : 1.5} />
        </g>
      );
    })}
  </g>
);

export const MenuBar = ({ app, clock, space, ping, pingSpace }: { app: string; clock: string; space: number; ping?: number; pingSpace?: number }) => (
  <g>
    <rect width={1920} height={MENU_H} fill="#FFFFFF" opacity={0.55} />
    <circle cx={34} cy={MENU_H / 2} r={9} fill={C.navyInk} />
    <text x={62} y={MENU_H / 2 + 7} fontFamily={FONT.ui} fontWeight={700} fontSize={20} fill={C.navyInk}>
      {app}
    </text>
    {[64, 56, 60, 72].map((w, i) => (
      <rect key={i} x={210 + i * 96} y={MENU_H / 2 - 5} width={w} height={10} rx={5} fill={C.navyInk} opacity={0.35} />
    ))}
    <g transform={`translate(1440 0)`}>
      <rect x={0} y={8} width={120} height={MENU_H - 16} rx={14} fill={SPACE_COLORS[space].deep} />
      <text x={60} y={MENU_H / 2 + 7} textAnchor="middle" fontFamily={FONT.ui} fontWeight={700} fontSize={18} fill={C.navyInk}>
        Space {space}
      </text>
      <SpaceDots x={150} y={MENU_H / 2} current={space} ping={ping} pingSpace={pingSpace} />
    </g>
    <text x={1890} y={MENU_H / 2 + 7} textAnchor="end" fontFamily={FONT.ui} fontWeight={600} fontSize={20} fill={C.navyInk}>
      {clock}
    </text>
  </g>
);

const DOCK_ICONS = [C.seaLight, C.coral, "#93CBAE", C.navy, "#B7A7E3", "#F5C95C", "#E596A5", C.navyInk];

export const Dock = () => {
  const n = DOCK_ICONS.length;
  const size = 76;
  const gap = 18;
  const w = n * size + (n + 1) * gap;
  const x0 = 960 - w / 2;
  return (
    <g>
      <rect x={x0} y={1080 - size - 40} width={w} height={size + 2 * gap} rx={30} fill="#FFFFFF" opacity={0.45} />
      {DOCK_ICONS.map((color, i) => (
        <g key={i}>
          <rect x={x0 + gap + i * (size + gap)} y={1080 - size - 40 + gap} width={size} height={size} rx={20} fill={color} />
          <circle cx={x0 + gap + i * (size + gap) + size / 2} cy={1080 - size - 40 + gap + size / 2} r={16} fill="#FFFFFF" opacity={0.6} />
        </g>
      ))}
    </g>
  );
};

type Props = {
  space: number;
  frame: number;
  app: string;
  clock: string;
  children?: ReactNode;
  overlay?: ReactNode;
  ping?: number;
  pingSpace?: number;
  /** Shift the whole desktop sideways, as macOS does when switching Spaces. */
  offsetX?: number;
  menuSpace?: number;
};

export const Desktop = ({ space, frame, app, clock, children, overlay, ping, pingSpace, offsetX = 0, menuSpace }: Props) => (
  <g>
    <g transform={`translate(${offsetX} 0)`}>
      <Wallpaper space={space} frame={frame} />
      {children}
    </g>
    <MenuBar app={app} clock={clock} space={menuSpace ?? space} ping={ping} pingSpace={pingSpace} />
    <Dock />
    {overlay}
  </g>
);

/** macOS arrow pointer; tip at (x, y). */
export const Cursor = ({ x, y, scale = 1.4, grab = false }: { x: number; y: number; scale?: number; grab?: boolean }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {grab ? (
      <g>
        <path d="M -2 6 Q -2 -6 8 -6 Q 12 -14 20 -10 Q 26 -16 32 -10 Q 40 -12 40 -2 V 18 Q 40 32 24 34 H 10 Q -2 32 -4 20 Z" fill="#fff" stroke="#000" strokeWidth={2.2} />
      </g>
    ) : (
      <path d="M 0 0 L 0 34 L 9 26 L 15 40 L 21 37 L 15 24 L 27 24 Z" fill="#000" stroke="#fff" strokeWidth={2.5} strokeLinejoin="round" />
    )}
  </g>
);
