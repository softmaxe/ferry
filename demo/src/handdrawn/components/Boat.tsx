import { useId, type ReactNode } from "react";
import { pencilSeed } from "../anim";
import { RoughDrawing } from "../rough";
import { C } from "../theme";

// Geometry traced from docs/assets/ferry-logo.png. The origin is the middle of
// the keel, and carried drawings use their bottom edge as the deck baseline.
export const DECK = { left: -350, right: 255, y: -215 };

const HULL =
  "M 262 717 H 318 Q 336 717 338 698 Q 342 677 362 677 H 858 Q 880 677 905 660 Q 935 636 975 635 H 1113 Q 1140 637 1130 662 L 1090 752 Q 1040 862 920 890 Q 905 892 890 892 H 332 Q 292 892 280 855 L 247 748 Q 242 717 262 717 Z";
const STRIPE =
  "M 247 742 H 845 Q 875 742 905 722 Q 945 698 980 697 H 1118 L 1108 720 H 985 Q 955 720 920 740 Q 885 764 845 764 H 254 Z";
const CABIN = "M 452 360 H 815 Q 880 360 897 425 L 946 636 L 447 690 L 412 425 Q 404 360 452 360 Z";
const PANE =
  "M 484 474 H 852 Q 870 474 873 492 L 891 608 Q 893 638 868 638 H 505 Q 487 638 484 620 L 467 495 Q 465 474 484 474 Z";
// The exposed cabin and hull perimeter form one connected pen stroke.
const OUTLINE =
  "M 447 677 L 412 425 Q 404 360 452 360 H 815 Q 880 360 897 425 L 946 636 Q 960 635 975 635 H 1113 Q 1140 637 1130 662 L 1090 752 Q 1040 862 920 890 Q 905 892 890 892 H 332 Q 292 892 280 855 L 247 748 Q 242 717 262 717 H 318 Q 336 717 338 698 Q 342 677 362 677 H 447";

const unit = (value: number) => Math.min(1, Math.max(0, value));

export type BoatProps = {
  x: number;
  y: number;
  frame?: number;
  scale?: number;
  rotate?: number;
  /** Mirror the shell so the bow points left. Cargo stays readable. */
  flip?: boolean;
  /** Reveal the traced outline, then the colored pencil marks. */
  progress?: number;
  /** 0 hides the logo's speed marks; 1 extends them fully. */
  speed?: number;
  /** Replaces the cabin; the node's (0, 0) sits at the deck center. */
  cargo?: ReactNode;
  /** A feet-origin character beside the cargo, in boat coordinates. */
  captain?: ReactNode;
  hideCabin?: boolean;
};

export const Boat = ({
  x, y, frame = 0, scale = 1, rotate = 0, flip = false,
  progress = 1, speed = 0, cargo, captain, hideCabin = false,
}: BoatProps) => {
  const cabin = !hideCabin && !cargo;
  const p = unit(progress);
  const color = unit((p - 0.48) / 0.52);
  const detail = unit((p - 0.58) / 0.42);
  const seed = pencilSeed(416, p < 1 ? 0 : frame);
  const crayonId = `boat-crayon-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
      <defs>
        {/* Static crayon grain adapted from animate-test's Clawd fill. */}
        <filter id={crayonId} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9 0.35" numOctaves={2} seed={416} result="grain" />
          <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 1.75" result="mask" />
          <feComposite in="SourceGraphic" in2="mask" operator="in" />
        </filter>
      </defs>
      <g transform={`scale(${flip ? -1 : 1} 1) translate(-690 -892)`}>
        {speed > 0 && (
          <RoughDrawing
            seed={seed + 5}
            progress={p}
            options={{ stroke: C.coral, strokeWidth: 12, roughness: 1.6 }}
            deps={[speed]}
            build={(g, o) => [
              g.line(390 - 147 * unit(speed), 490, 390, 490, o),
              g.line(398 - 230 * unit(speed), 560, 398, 560, o),
              g.line(410 - 167 * unit(speed), 628, 410, 628, o),
            ]}
          />
        )}
        <g opacity={color}>
          {/* Opaque paper keeps the horizon and sun behind the penciled hull. */}
          {cabin && <path d={CABIN} fill={C.paper} />}
          <path d={HULL} fill={C.paper} />
          <g filter={`url(#${crayonId})`}>
            {cabin && <path d={CABIN} fill={C.coral} opacity={0.45} />}
            <path d={HULL} fill={C.navy} opacity={0.45} />
            <RoughDrawing
              seed={seed + 10}
              deps={[cabin]}
              options={{ stroke: "none", fillStyle: "hachure", fillWeight: 3.4, hachureGap: 8, roughness: 1.3 }}
              build={(g, o) => [
                ...(cabin ? [g.path(CABIN, { ...o, fill: C.coral, hachureAngle: -38 })] : []),
                g.path(HULL, { ...o, fill: C.navy, hachureAngle: -38 }),
              ]}
            />
          </g>
          <path d={STRIPE} fill={C.paper} />
          {cabin && <path d={PANE} fill={C.paper} />}
          {cabin && [476, 543, 609].map((cx) => <circle key={cx} cx={cx} cy={422} r={21} fill={C.paper} />)}
        </g>
        <RoughDrawing
          seed={seed}
          progress={unit(p / 0.8)}
          deps={[cabin]}
          options={{ stroke: C.navyInk, strokeWidth: 4.5, roughness: 0.8, disableMultiStroke: true }}
          build={(g, o) => {
            const outline = g.path(cabin ? OUTLINE : HULL, o);
            // Rough.js starts each segment with a move. Join them so SVG's dash
            // reveal advances around the contour once instead of on every edge.
            for (const set of outline.sets) {
              set.ops = set.ops.map((op, index) => op.op === "move" && index > 0 ? { op: "lineTo", data: op.data } : op);
            }
            return [outline];
          }}
        />
        <RoughDrawing
          seed={seed + 20}
          progress={detail}
          deps={[cabin]}
          options={{ stroke: C.navyInk, strokeWidth: 2.6, roughness: 0.65 }}
          build={(g, o) => [
            g.path("M 362 677 H 858 Q 880 677 905 660 Q 935 636 975 635", o),
            g.path(STRIPE, { ...o, stroke: C.navy, strokeWidth: 1.8 }),
            ...(cabin ? [
              g.path(PANE, { ...o, stroke: C.coralDeep }),
              ...[476, 543, 609].map((cx) => g.circle(cx, 422, 42, { ...o, stroke: C.coralDeep, strokeWidth: 1.8 })),
            ] : []),
          ]}
        />
      </g>
      {cargo && <g transform={`translate(0 ${DECK.y})`} opacity={detail}>{cargo}</g>}
      {captain && <g transform={`translate(${flip ? 285 : -285} ${DECK.y})`} opacity={detail}>{captain}</g>}
    </g>
  );
};

/** Sparse pencil ripples behind a moving boat. */
export const Wake = ({ x, y, length, frame, flip = false, opacity = 1 }: {
  x: number;
  y: number;
  length: number;
  frame: number;
  flip?: boolean;
  opacity?: number;
}) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`} opacity={opacity}>
    <RoughDrawing
      seed={pencilSeed(466, frame)}
      deps={[length]}
      options={{ stroke: C.sea, strokeWidth: 2.4, roughness: 1.1 }}
      build={(g, o) => [
        g.curve([[-18, 0], [-length * 0.3, 4], [-length * 0.8, 1], [-length, 5]], o),
        g.curve([[-40, 15], [-length * 0.4, 19], [-length * 0.72, 16]], o),
        g.line(-length * 0.5, 32, -length * 0.86, 34, o),
      ]}
    />
  </g>
);
