import { Easing, interpolate, spring } from "remotion";
import { FPS, cueFrame, eighths } from "./timeline";

export const ease = {
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  out: Easing.bezier(0.16, 1, 0.3, 1),
  in: Easing.bezier(0.55, 0, 0.9, 0.4),
  soft: Easing.bezier(0.45, 0, 0.25, 1),
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** 0 → 1 over `duration` frames starting at `start`, eased. */
export const progress = (frame: number, start: number, duration: number, easing = ease.inOut) =>
  duration <= 0 ? (frame >= start ? 1 : 0) : easing(clamp01((frame - start) / duration));

/** Progress for a named cue lasting `beats` eighth notes. */
export const cueProgress = (frame: number, cue: string, beats: number, easing = ease.inOut, offsetBeats = 0) =>
  progress(frame, cueFrame(cue) + eighths(offsetBeats), eighths(beats), easing);

/** A spring that starts at `start`; 0 before it. */
export const pop = (frame: number, start: number, damping = 12, stiffness = 170, mass = 0.8) =>
  frame < start ? 0 : spring({ frame: frame - start, fps: FPS, config: { damping, stiffness, mass } });

export const cuePop = (frame: number, cue: string, offsetBeats = 0, damping = 12) =>
  pop(frame, cueFrame(cue) + eighths(offsetBeats), damping);

/** Maps `frame` through keyframes [[frame, value], ...] with easing on each segment. */
export const keys = (frame: number, points: [number, number][], easing = ease.inOut) =>
  interpolate(
    frame,
    points.map((p) => p[0]),
    points.map((p) => p[1]),
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing },
  );

export type Rect = { x: number; y: number; w: number; h: number };

export const FULL: Rect = { x: 0, y: 0, w: 1920, h: 1080 };

/**
 * Camera between two viewports: width changes geometrically so a zoom feels constant-speed,
 * and the position follows the zoom so the target rectangle grows from where it sits.
 */
export const viewportBetween = (from: Rect, to: Rect, t: number): Rect => {
  const w = from.w * Math.pow(to.w / from.w, t);
  const k = from.w === to.w ? t : (from.w - w) / (from.w - to.w);
  return { x: lerp(from.x, to.x, k), y: lerp(from.y, to.y, k), w, h: (w * 9) / 16 };
};

/** Gentle bobbing on water, in pixels and degrees. */
export const bob = (frame: number, amp = 6, period = 110, phase = 0) => ({
  y: Math.sin(((frame + phase) / period) * Math.PI * 2) * amp,
  r: Math.sin(((frame + phase) / period) * Math.PI * 2 + 0.9) * (amp / 4),
});
