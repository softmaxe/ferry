// Adapted from animate-test/video/anim.ts; all callers pass absolute film frames.
import { interpolate } from "remotion";
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ramp = (frame: number, start: number, end: number) => interpolate(frame, [start, end], [0, 1], clamp);
export const lerp = (a: number, b: number, progress: number) => a + (b - a) * progress;
/** Only rough strokes change; the Paper texture is static. */
export const pencilSeed = (seed: number, frame: number) => seed + Math.floor(frame / 12) % 3;
