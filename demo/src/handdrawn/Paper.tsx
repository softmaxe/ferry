// Adapted from animate-test/video/components/Paper.tsx at 965b4fe.
// Texture seeds stay fixed for the entire film; only drawing strokes may jitter.
import { AbsoluteFill } from "remotion";
import { C } from "./theme";
export const Paper = () => (
  <AbsoluteFill style={{ backgroundColor: C.paper }}>
    <svg viewBox="0 0 1920 1080" width="100%" height="100%">
      <defs>
        <filter id="paper-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={3} seed={7} stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.42 0 0 0 0 0.32 0 0 0 0 0.2 0 0 0 -1.6 1.05" />
        </filter>
        <filter id="paper-fibre" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.035" numOctaves={4} seed={11} />
          <feColorMatrix type="matrix" values="0 0 0 0 0.55 0 0 0 0 0.43 0 0 0 0 0.27 0 0 0 -2.2 1.25" />
        </filter>
      </defs>
      <rect width="1920" height="1080" filter="url(#paper-fibre)" opacity="0.16" />
      <rect width="1920" height="1080" filter="url(#paper-grain)" opacity="0.3" />
    </svg>
  </AbsoluteFill>
);
