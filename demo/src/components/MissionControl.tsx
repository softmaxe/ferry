import { C, FONT, SPACE_COLORS } from "../theme";
import { Wallpaper } from "./Desktop";

export const THUMB = { w: 240, h: 135, y: 56, gap: 40 };
export const thumbX = (space: number) => 960 - (5 * THUMB.w + 4 * THUMB.gap) / 2 + (space - 1) * (THUMB.w + THUMB.gap);
export const thumbCenter = (space: number) => ({ x: thumbX(space) + THUMB.w / 2, y: THUMB.y + THUMB.h / 2 });

/** The Space strip across the top of Mission Control. `show` slides it in. */
export const SpaceStrip = ({ show, frame, highlight = 0, highlightSpace = 0 }: {
  show: number;
  frame: number;
  highlight?: number;
  highlightSpace?: number;
}) => (
  <g opacity={show} transform={`translate(0 ${(show - 1) * 180})`}>
    {[1, 2, 3, 4, 5].map((s) => {
      const x = thumbX(s);
      const lit = s === highlightSpace ? highlight : 0;
      return (
        <g key={s}>
          <svg x={x} y={THUMB.y} width={THUMB.w} height={THUMB.h} viewBox="0 0 1920 1080">
            <Wallpaper space={s} frame={frame} />
            <rect x={300} y={200} width={800} height={560} rx={40} fill="#fff" opacity={0.85} />
            <rect x={1000} y={320} width={640} height={480} rx={40} fill={SPACE_COLORS[s].deep} />
          </svg>
          <rect x={x} y={THUMB.y} width={THUMB.w} height={THUMB.h} rx={12} fill="none" stroke={lit > 0 ? C.coral : "#FFFFFF"} strokeWidth={lit > 0 ? 4 + lit * 4 : 2} opacity={lit > 0 ? 1 : 0.6} />
          <text x={x + THUMB.w / 2} y={THUMB.y + THUMB.h + 36} textAnchor="middle" fontFamily={FONT.ui} fontWeight={600} fontSize={22} fill="#FFFFFF">
            Space {s}
          </text>
        </g>
      );
    })}
  </g>
);
