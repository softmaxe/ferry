// Pose articulation and pencil fills adapted from animate-test's Clawd.tsx at 965b4fe.
// Ferri has its own square silhouette, navy pencil body, and coral chest window.
import { useId } from "react";
import { pencilSeed } from "../anim";
import { RoughDrawing } from "../rough";
import { C } from "../theme";

export const FERRI_POSES = ["rest", "typing", "scratch", "pleased", "wave", "steering"] as const;
export type FerriPose = (typeof FERRI_POSES)[number];
export type FerriEyes = "open" | "closed" | "happy";
type Point = [number, number];
type Arm = [Point, Point, Point];

export interface FerriProps {
  /** Ground point between the feet in the parent SVG. Body width is 172 at scale 1. */
  x: number;
  y: number;
  scale?: number;
  pose?: FerriPose;
  /** Pass an absolute frame or a scene-relative frame; no component clock is used. */
  frame?: number;
  fps?: number;
  seed?: number;
  flip?: boolean;
  rotate?: number;
  squash?: number;
  eyes?: FerriEyes;
  look?: readonly [number, number];
  legs?: boolean;
  /** Steering includes a wheel. Disable it when the surrounding boat supplies one. */
  wheel?: boolean;
  draw?: number;
  opacity?: number;
}

const BODY = 172;
const TOP = -196;
const sub = (p: number, a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)));
const outline = { stroke: C.navyInk, strokeWidth: 3, roughness: 0.9, bowing: 0.5 };
const hatch = {
  stroke: "none", fill: C.seaLight, fillStyle: "hachure", hachureAngle: -48,
  hachureGap: 5, fillWeight: 1.7, roughness: 1.25,
} as const;

export const isFerriBlinking = (frame: number, fps = 60, seed = 17) => {
  const period = Math.round(fps * 3.4);
  const offset = Math.round(fps * (seed % 7) * 0.23);
  return ((frame + offset) % period + period) % period >= period - Math.max(2, Math.round(fps * 0.07));
};

function poseArms(pose: FerriPose, seconds: number): [Arm, Arm] {
  const left: Arm = [[-79, -118], [-110, -99], [-114, -86]];
  const right: Arm = [[79, -118], [110, -99], [114, -86]];
  if (pose === "typing") {
    const tap = Math.sin(seconds * Math.PI * 8) * 4;
    return [left, [[79, -118], [112, -83], [146, -68 + tap]]];
  }
  if (pose === "scratch") {
    const rub = Math.sin(seconds * Math.PI * 5) * 3;
    return [left, [[79, -118], [120, -160], [96 + rub, -191]]];
  }
  if (pose === "pleased") {
    return [[[-79, -118], [-98, -77], [-103, -59]], [[79, -118], [98, -77], [103, -59]]];
  }
  if (pose === "wave") {
    const wave = Math.sin(seconds * Math.PI * 2.5) * 14;
    return [left, [[79, -118], [116, -159], [125 + wave, -211]]];
  }
  if (pose === "steering") {
    const turn = Math.sin(seconds * Math.PI * 0.9) * 5;
    return [
      [[-79, -118], [-106, -69], [-32, -38 - turn]],
      [[79, -118], [106, -69], [32, -38 + turn]],
    ];
  }
  return [left, right];
}

function armPolygon([shoulder, elbow, hand]: Arm): Point[] {
  const normal = (a: Point, b: Point): Point => {
    const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
    return [-(b[1] - a[1]) / length * 9, (b[0] - a[0]) / length * 9];
  };
  const a = normal(shoulder, elbow);
  const b = normal(elbow, hand);
  const mid: Point = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const shift = (p: Point, n: Point, direction: number): Point => [p[0] + n[0] * direction, p[1] + n[1] * direction];
  return [shift(shoulder, a, 1), shift(elbow, mid, 1), shift(hand, b, 1), shift(hand, b, -1), shift(elbow, mid, -1), shift(shoulder, a, -1)];
}

export const Ferri: React.FC<FerriProps> = ({
  x, y, scale = 1, pose = "rest", frame = 0, fps = 60, seed = 17,
  flip = false, rotate = 0, squash = 1, eyes, look, legs = true, wheel = true, draw = 1, opacity = 1,
}) => {
  const grainId = `ferri-pencil-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const seconds = frame / fps;
  const strokeSeed = pencilSeed(seed, frame);
  const outlineP = sub(draw, 0, 0.62);
  const fillP = sub(draw, 0.35, 0.9);
  const detailP = sub(draw, 0.62, 1);
  const arms = poseArms(pose, seconds);
  const face = eyes ?? (pose === "pleased" ? "happy" : isFerriBlinking(frame, fps, seed) ? "closed" : "open");
  const gaze = look ?? (pose === "typing" ? [0.75, 0.3] : pose === "scratch" ? [0.25, -0.25] : [0, 0]);
  const tilt = rotate + (pose === "scratch" ? -4 : pose === "typing" ? 2 : pose === "wave" ? -2 : 0);
  const breathe = pose === "pleased" ? Math.sin(seconds * Math.PI * 1.4) * 0.015 : 0;
  const sy = squash + breathe;
  const arm = (points: Arm, index: number) => {
    const polygon = armPolygon(points);
    return (
      <g key={index}>
        <polygon points={polygon.map((point) => point.join(",")).join(" ")} fill={C.navy} opacity={fillP} filter={`url(#${grainId})`} />
        <RoughDrawing seed={seed + 30 + index} options={hatch} progress={fillP} deps={polygon.flat()} build={(g, o) => [g.polygon(polygon, o)]} />
        <RoughDrawing seed={strokeSeed + 30 + index} options={outline} progress={outlineP} deps={polygon.flat()} build={(g, o) => [g.polygon(polygon, o)]} />
      </g>
    );
  };

  return (
    <g data-ferri-pose={pose} transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale * (flip ? -1 : 1) / Math.sqrt(sy)} ${scale * sy})`} opacity={opacity}>
      <defs>
        <filter id={grainId} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.82 0.32" numOctaves={2} seed={seed} result="grain" />
          <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -2.1 1.8" result="mask" />
          <feComposite in="SourceGraphic" in2="mask" operator="in" />
        </filter>
      </defs>

      {legs && [-59, -31, 31, 59].map((cx, i) => (
        <PencilBlock key={cx} x={cx - 9} y={-29} w={18} h={29} seed={seed + 20 + i} strokeSeed={strokeSeed + 20 + i} grainId={grainId} fillP={fillP} outlineP={outlineP} />
      ))}
      {pose !== "steering" && arms.map(arm)}
      <rect x={-BODY / 2 + 2} y={TOP + 2} width={BODY - 4} height={BODY - 4} fill={C.paper} opacity={outlineP} />
      <PencilBlock x={-BODY / 2} y={TOP} w={BODY} h={BODY} seed={seed} strokeSeed={strokeSeed} grainId={grainId} fillP={fillP} outlineP={outlineP} />

      <g opacity={detailP}>
        <g transform={`translate(${gaze[0] * 8} ${gaze[1] * 5})`}>
          {[-1, 1].map((side) => <Eye key={side} x={side * 34} eyes={face} seed={strokeSeed + 40 + side} />)}
          {pose === "scratch" && <RoughDrawing seed={strokeSeed + 44} options={{ stroke: C.whitePaper, strokeWidth: 4, roughness: 0.6 }} build={(g, o) => [g.line(21, -175, 46, -181, o)]} />}
        </g>
        <rect x={-35} y={-105} width={70} height={52} fill={C.coral} />
        <RoughDrawing seed={strokeSeed + 50} options={{ ...outline, stroke: C.navyDeep, strokeWidth: 2.5 }} build={(g, o) => [g.rectangle(-35, -105, 70, 52, o)]} />
        <RoughDrawing seed={seed + 51} options={{ ...hatch, fill: C.coralDeep, hachureGap: 5, fillWeight: 1.1 }} build={(g, o) => [g.rectangle(-32, -102, 64, 46, o)]} />
        <path d="M0 -101 V-57 M-31 -89 H31" fill="none" stroke={C.navyDeep} strokeWidth={4.5} strokeLinecap="square" />
        <path d="M-30 -108 H29" fill="none" stroke={C.whitePaper} strokeWidth={3} opacity={0.75} />
      </g>

      {pose === "steering" && (
        <>
          {wheel && <Helm frame={frame} fps={fps} seed={strokeSeed + 60} opacity={detailP} />}
          {arms.map(arm)}
        </>
      )}
    </g>
  );
};

const PencilBlock: React.FC<{
  x: number; y: number; w: number; h: number; seed: number; strokeSeed: number;
  grainId: string; fillP: number; outlineP: number;
}> = ({ x, y, w, h, seed, strokeSeed, grainId, fillP, outlineP }) => (
  <g>
    <rect x={x + 1} y={y + 1} width={w - 2} height={h - 2} fill={C.navy} opacity={fillP} filter={`url(#${grainId})`} />
    <g opacity={0.74 * fillP}>
      <RoughDrawing seed={seed + 100} options={hatch} build={(g, o) => [g.rectangle(x + 2, y + 2, w - 4, h - 4, o)]} />
    </g>
    <RoughDrawing seed={strokeSeed} options={outline} progress={outlineP} build={(g, o) => [g.rectangle(x, y, w, h, o)]} />
  </g>
);

const Eye: React.FC<{ x: number; eyes: FerriEyes; seed: number }> = ({ x, eyes, seed }) => {
  const options = { stroke: C.whitePaper, strokeWidth: 5.8, roughness: 0.6, bowing: 0.25 };
  if (eyes === "closed") {
    return <RoughDrawing seed={seed} options={options} deps={[eyes, x]} build={(g, o) => [g.line(x - 10, -148, x + 10, -148, o)]} />;
  }
  if (eyes === "happy") {
    return <RoughDrawing seed={seed} options={options} deps={[eyes, x]} build={(g, o) => [g.linearPath([[x - 11, -143], [x, -155], [x + 11, -143]], o)]} />;
  }
  return <RoughDrawing seed={seed} options={{ ...options, strokeWidth: 1.7, fill: C.whitePaper, fillStyle: "solid" }} deps={[eyes, x]} build={(g, o) => [g.rectangle(x - 9, -168, 18, 27, o)]} />;
};

const Helm: React.FC<{ frame: number; fps: number; seed: number; opacity: number }> = ({ frame, fps, seed, opacity }) => (
  <g transform={`rotate(${Math.sin(frame / fps * Math.PI * 0.9) * 7} 0 -31)`} opacity={opacity}>
    <RoughDrawing seed={seed} options={{ stroke: C.coralDeep, strokeWidth: 6, roughness: 0.6 }} build={(g, o) => [g.circle(0, -31, 68, o)]} />
    <RoughDrawing seed={seed + 1} options={{ stroke: C.navyInk, strokeWidth: 4, roughness: 0.6 }} build={(g, o) => [g.line(-40, -31, 40, -31, o), g.line(0, -71, 0, 9, o), g.line(-28, -59, 28, -3, o), g.line(-28, -3, 28, -59, o)]} />
    <circle cx={0} cy={-31} r={7} fill={C.coral} stroke={C.navyInk} strokeWidth={3} />
  </g>
);
