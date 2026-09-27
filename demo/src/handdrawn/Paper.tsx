// Adapted from animate-test/video/components/Paper.tsx at 965b4fe.
// Decode the fixed SVG once as an image so Chromium caches the paper's filter result.
import { AbsoluteFill, Img } from "remotion";
import { C } from "./theme";

const texture = `
<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs>
    <filter id="paper-grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="7" stitchTiles="stitch" />
      <feColorMatrix type="matrix" values="0 0 0 0 0.42 0 0 0 0 0.32 0 0 0 0 0.2 0 0 0 -1.6 1.05" />
    </filter>
    <filter id="paper-fibre" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.006 0.035" numOctaves="4" seed="11" />
      <feColorMatrix type="matrix" values="0 0 0 0 0.55 0 0 0 0 0.43 0 0 0 0 0.27 0 0 0 -2.2 1.25" />
    </filter>
  </defs>
  <rect width="1920" height="1080" fill="${C.paper}" />
  <rect width="1920" height="1080" filter="url(#paper-fibre)" opacity="0.16" />
  <rect width="1920" height="1080" filter="url(#paper-grain)" opacity="0.3" />
</svg>`;
const source = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(texture)}`;

export const Paper = () => (
  <AbsoluteFill style={{ backgroundColor: C.paper }}>
    <Img src={source} style={{ width: "100%", height: "100%" }} />
  </AbsoluteFill>
);
