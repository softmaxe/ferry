// Broad translucent washes adapted from animate-test's beat5/Landscape.tsx.
// Each clock's fixed SVG is cached as an image; crossfades never regenerate its grain.
import { AbsoluteFill, Img, interpolate, interpolateColors } from "remotion";
import { clamp, ramp, smooth } from "./anim";
import { C } from "./theme";
import { beatAt, beats, beatStartFrame, eighths, positionFrame, timeline, TOTAL_FRAMES } from "./timeline";

const clockMinutes = (clock: string) => {
  const [hour, minute] = clock.split(":").map(Number);
  return hour * 60 + minute;
};
const DAY_STOPS = [510, 840, 1050, 1170];

const washSource = (clock: string) => {
  const minute = clockMinutes(clock);
  const upper = interpolateColors(minute, DAY_STOPS, [C.seaLight, C.sunsetGold, C.sunsetRose, C.sunsetPlum]);
  const middle = interpolateColors(minute, DAY_STOPS, [C.cream, C.sunsetGold, C.sunsetGold, C.sunsetRose]);
  const glow = interpolateColors(minute, DAY_STOPS, [C.sunsetGold, C.cream, C.sunsetRose, C.sunsetGold]);
  const strength = interpolate(minute, DAY_STOPS, [0.16, 0.18, 0.24, 0.32], clamp);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
    <defs>
      <filter id="wash-edge" x="-10%" y="-15%" width="120%" height="130%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.022" numOctaves="2" seed="502" result="warp"/>
        <feDisplacementMap in="SourceGraphic" in2="warp" scale="64" xChannelSelector="R" yChannelSelector="G"/>
        <feGaussianBlur stdDeviation="15"/>
      </filter>
      <linearGradient id="sky" x1="0" y1="0" x2="0.1" y2="1">
        <stop offset="0" stop-color="${upper}" stop-opacity="0.25"/>
        <stop offset="0.27" stop-color="${upper}" stop-opacity="0.95"/>
        <stop offset="0.7" stop-color="${middle}" stop-opacity="0.65"/>
        <stop offset="1" stop-color="${middle}" stop-opacity="0"/>
      </linearGradient>
      <radialGradient id="glow">
        <stop offset="0" stop-color="${glow}" stop-opacity="0.85"/>
        <stop offset="0.6" stop-color="${glow}" stop-opacity="0.45"/>
        <stop offset="1" stop-color="${glow}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <g opacity="${strength}" filter="url(#wash-edge)">
      <path d="M34 48 Q480 0 918 62 Q1342 20 1880 56 L1880 792 Q1510 916 1140 820 Q634 916 42 782 Z" fill="url(#sky)"/>
      <ellipse cx="1470" cy="505" rx="735" ry="466" fill="url(#glow)"/>
      <ellipse cx="300" cy="720" rx="460" ry="225" fill="url(#glow)" opacity="0.3"/>
    </g>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const WASHES = new Map(beats.map((beat) => [beat.clock, washSource(beat.clock)]));

/** Mount once above Paper and below all drawings. Beat clocks drive the color. */
export const DayWash = ({ frame }: { frame: number }) => {
  const beat = beatAt(frame);
  const previous = beats[Math.max(0, beats.indexOf(beat) - 1)];
  const change = previous.clock === beat.clock ? 1 : smooth(ramp(frame, beatStartFrame(beat), beatStartFrame(beat) + eighths(3)));
  const style = { position: "absolute", inset: 0, width: "100%", height: "100%" } as const;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {change < 1 && <Img src={WASHES.get(previous.clock)!} style={{ ...style, opacity: 1 - change }} />}
      {change > 0 && <Img src={WASHES.get(beat.clock)!} style={{ ...style, opacity: change }} />}
    </AbsoluteFill>
  );
};

/** Apply to the wash, scene and captions together. Paper and audio stay outside. */
export const closingOpacity = (frame: number) =>
  1 - smooth(ramp(frame, positionFrame(timeline.bars), TOTAL_FRAMES - 1));
