import type { ReactNode } from "react";
import { C } from "../theme";

// Geometry traced from docs/assets/ferry-logo.png (1254 px canvas), re-origined so (0, 0) is
// the middle of the keel. The deck runs from x = -350 to 255 at y = -215.

const DECK = { left: -350, right: 255, y: -215 };

/**
 * The world rectangle of a window riding on the deck of a boat whose keel is at (x, y), drawn
 * at `scale`: centred on the deck, resting on it, and keeping the window's aspect ratio.
 */
export const onDeck = (x: number, y: number, scale: number, size: { w: number; h: number }) => {
  const w = 0.62 * 880 * scale;
  const h = (w * size.h) / size.w;
  const cx = x + ((DECK.left + DECK.right) / 2) * scale;
  const bottom = y + DECK.y * scale + 6;
  return { x: cx - w / 2, y: bottom - h, w, h };
};

const HULL =
  "M 262 717 H 318 Q 336 717 338 698 Q 342 677 362 677 H 858 Q 880 677 905 660 Q 935 636 975 635 H 1113 Q 1140 637 1130 662 L 1090 752 Q 1040 862 920 890 Q 905 892 890 892 H 332 Q 292 892 280 855 L 247 748 Q 242 717 262 717 Z";
const STRIPE =
  "M 247 742 H 845 Q 875 742 905 722 Q 945 698 980 697 H 1118 L 1108 720 H 985 Q 955 720 920 740 Q 885 764 845 764 H 254 Z";
const CABIN = "M 452 360 H 815 Q 880 360 897 425 L 946 636 L 447 690 L 412 425 Q 404 360 452 360 Z";
const PANE =
  "M 484 474 H 852 Q 870 474 873 492 L 891 608 Q 893 638 868 638 H 505 Q 487 638 484 620 L 467 495 Q 465 474 484 474 Z";

type Props = {
  x: number;
  y: number;
  scale?: number;
  rotate?: number;
  /** Mirror so the bow points left. */
  flip?: boolean;
  /** 0 hides the speed lines, 1 shows them fully extended. */
  speed?: number;
  /** Replaces the logo's cabin with a carried window, drawn in deck coordinates. */
  cargo?: ReactNode;
  hideCabin?: boolean;
};

export const Boat = ({ x, y, scale = 1, rotate = 0, flip = false, speed = 1, cargo, hideCabin }: Props) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${flip ? -scale : scale} ${scale})`}>
    <g transform="translate(-690 -892)">
      {speed > 0 && (
        <g fill={C.coral} opacity={Math.min(1, speed * 1.4)}>
          {[
            [243, 390, 470],
            [168, 398, 540],
            [243, 410, 608],
          ].map(([x1, x2, y1], i) => {
            const len = (x2 - x1) * speed;
            return <rect key={i} x={x2 - len} y={y1} width={len} height={42} rx={21} />;
          })}
        </g>
      )}
      {!hideCabin && !cargo && (
        <g>
          <path d={CABIN} fill={C.coral} />
          <path d={PANE} fill={C.cream} />
          {[476, 543, 609].map((cx) => (
            <circle key={cx} cx={cx} cy={422} r={21} fill={C.cream} />
          ))}
        </g>
      )}
      {cargo && <g transform="translate(690 677)">{cargo}</g>}
      <path d={HULL} fill={C.navy} />
      <path d={STRIPE} fill={C.cream} />
    </g>
  </g>
);

/** Foamy wake trailing behind a boat moving right (mirror with `flip`). */
export const Wake = ({ x, y, length, frame, flip = false, opacity = 1 }: {
  x: number;
  y: number;
  length: number;
  frame: number;
  flip?: boolean;
  opacity?: number;
}) => {
  const dir = flip ? 1 : -1;
  return (
    <g opacity={opacity} fill="none" stroke={C.foam} strokeLinecap="round">
      {[0, 1, 2].map((i) => {
        const shift = ((frame * 3 + i * 40) % 120) / 120;
        const x1 = x + dir * (20 + i * length * 0.28 + shift * 30);
        const w = length * (0.5 - i * 0.12);
        return (
          <line key={i} x1={x1} y1={y + i * 9} x2={x1 + dir * w} y2={y + i * 9} strokeWidth={10 - i * 2} opacity={1 - i * 0.25} />
        );
      })}
    </g>
  );
};
