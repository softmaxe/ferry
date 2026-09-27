// Circle overshoot and tick geometry adapted from animate-test at 965b4fe.
import { useId } from "react";
import { RoughDrawing } from "../rough";
import { C, FONT } from "../theme";

type Point = [number, number];
type PenProps = { progress: number; seed?: number; strokeWidth?: number; opacity?: number };
const pen = { stroke: C.accent, roughness: 0.7, bowing: 0.5 };
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

export const RedPenCircle = ({ cx, cy, rx, ry, progress, seed = 331, strokeWidth = 6, opacity = 1, note, noteX = cx + rx, noteY = cy - ry - 25, noteProgress = progress, noteSize = 74 }: PenProps & {
  cx: number; cy: number; rx: number; ry: number; note?: string; noteX?: number; noteY?: number; noteProgress?: number; noteSize?: number;
}) => {
  const clipId = `red-note-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const width = Math.max(noteSize, [...(note ?? "")].length * noteSize);
  return (
    <g opacity={opacity}>
      <RoughDrawing seed={seed} progress={progress} deps={[cx, cy, rx, ry]} options={{ ...pen, strokeWidth }} build={(g, o) => [g.curve(
        Array.from({ length: 19 }, (_, i): Point => {
          const angle = -0.9 - i / 18 * Math.PI * 2.24;
          const growth = 1 + i / 18 * 0.04;
          return [cx + Math.cos(angle) * rx * growth, cy + Math.sin(angle) * ry * growth];
        }), o)]} />
      {note && noteProgress > 0 && <g>
        <defs><clipPath id={clipId}><rect x={noteX - noteSize * 0.15} y={noteY - noteSize * 1.2} width={(width + noteSize * 0.3) * clamp01(noteProgress)} height={noteSize * 1.5} /></clipPath></defs>
        <text x={noteX} y={noteY} fontFamily={FONT.hand} fontSize={noteSize} fill={C.accent} clipPath={`url(#${clipId})`} transform={`rotate(-7 ${noteX} ${noteY})`}>{note}</text>
      </g>}
    </g>
  );
};

export const RedPenStrike = ({ from, to, progress, seed = 341, strokeWidth = 6, opacity = 1 }: PenProps & { from: Point; to: Point }) => (
  <g opacity={opacity}><RoughDrawing seed={seed} progress={progress} deps={[...from, ...to]} options={{ ...pen, strokeWidth }} build={(g, o) => [g.line(...from, ...to, o)]} /></g>
);

export const RedPenTick = ({ x, y, size = 70, progress, seed = 351, strokeWidth = 7, opacity = 1 }: PenProps & { x: number; y: number; size?: number }) => (
  <g opacity={opacity}><RoughDrawing seed={seed} progress={progress} deps={[x, y, size]} options={{ ...pen, strokeWidth }} build={(g, o) => [g.linearPath([[x, y + size * 0.5], [x + size * 0.32, y + size * 0.83], [x + size, y]], o)]} /></g>
);

export const RedPenArrow = ({ from, to, bend = 0, progress, seed = 361, strokeWidth = 5, opacity = 1 }: PenProps & { from: Point; to: Point; bend?: number }) => {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const length = Math.max(1, Math.hypot(dx, dy));
  const mid: Point = [(from[0] + to[0]) / 2 - dy / length * bend, (from[1] + to[1]) / 2 + dx / length * bend];
  const angle = Math.atan2(to[1] - mid[1], to[0] - mid[0]);
  const head = Math.min(26, length * 0.22);
  return <g opacity={opacity}><RoughDrawing seed={seed} progress={progress} deps={[...from, ...to, bend]} options={{ ...pen, strokeWidth }} build={(g, o) => [
    g.curve([from, mid, to], o),
    g.linearPath([[to[0] - Math.cos(angle - 0.5) * head, to[1] - Math.sin(angle - 0.5) * head], to, [to[0] - Math.cos(angle + 0.5) * head, to[1] - Math.sin(angle + 0.5) * head]], o),
  ]} /></g>;
};
