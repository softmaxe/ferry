import { RoughDrawing } from "../rough";
import { C, FONT, SPACE_COLORS } from "../theme";
import { pencilSeed } from "../anim";
import type { BeatProps } from "./types";
export const Placeholder = ({ frame, beat, text }: BeatProps) => (
  <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
    <text x="170" y="170" fontFamily={FONT.hand} fontSize="66" fill={C.navy}>{beat.name}</text>
    <RoughDrawing seed={pencilSeed(70, frame)} options={{ stroke: C.navy, strokeWidth: 4, roughness: 1.3 }}
      build={(g, o) => [g.rectangle(280, 235, 1360, 510, o), g.line(280, 297, 1640, 297, o), g.line(210, 794, 1710, 794, o)]} />
    {[1, 2, 3, 4, 5].map((space) => (
      <g key={space} transform={`translate(${330 + (space - 1) * 260},390)`}>
        <RoughDrawing seed={space + 21} options={{ stroke: C.navy, strokeWidth: 3, fill: SPACE_COLORS[space].wall, fillStyle: "hachure", hachureGap: 8 }} build={(g, o) => [g.rectangle(0, 0, 220, 210, o)]} />
        <text x="110" y="105" textAnchor="middle" fontFamily={FONT.hand} fontSize="42" fill={C.navy}>{text.pier} {space}</text>
      </g>
    ))}
  </svg>
);
