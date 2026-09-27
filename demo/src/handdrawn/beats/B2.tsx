import { lerp, pencilSeed, ramp } from "../anim";
import { Boat, Wake } from "../components/Boat";
import { RoughDrawing } from "../rough";
import { C, FONT } from "../theme";
import { cueFrame, eighths } from "../timeline";
import type { BeatProps } from "./types";

const SEA_Y = 626;
const easeOut = (p: number) => 1 - (1 - p) ** 3;
const TAGLINE_CUES = ["b2.tagline1", "b2.tagline2", "b2.tagline3"];

export const B2 = ({ frame, lang, text }: BeatProps) => {
  const start = cueFrame("b2.boat");
  const nameAt = cueFrame("b2.name");
  const draw = ramp(frame, start, nameAt - eighths(0.4));
  const sail = easeOut(ramp(frame, start, nameAt));
  const name = easeOut(ramp(frame, nameAt, nameAt + eighths(1.5)));
  const x = lerp(620, 960, sail);
  const bob = Math.sin((frame - start) / 35) * 3;
  const centers = lang === "zh" ? [588, 952, 1340] : [505, 941, 1395];

  return (
    <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
      <RoughDrawing
        seed={pencilSeed(260, frame)}
        progress={ramp(frame, start, start + eighths(2))}
        options={{ stroke: C.sea, strokeWidth: 2.8, roughness: 1.1 }}
        build={(g, o) => [
          g.curve([[252, SEA_Y], [546, SEA_Y - 4], [906, SEA_Y + 2], [1288, SEA_Y - 3], [1664, SEA_Y]], o),
          g.line(364, SEA_Y + 25, 516, SEA_Y + 27, o),
          g.line(1390, SEA_Y + 31, 1558, SEA_Y + 29, o),
        ]}
      />
      <Wake x={x - 254} y={SEA_Y + 4} length={230} frame={frame} opacity={draw * (1 - sail) * 0.8} />
      <Boat x={x} y={SEA_Y + bob} frame={frame} scale={0.59} rotate={Math.sin((frame - start) / 48) * 0.45} progress={draw} speed={0.85} />

      <text
        x={960} y={242 + (1 - name) * 36} textAnchor="middle"
        fontFamily={FONT.hand} fontSize={176} fill={C.navy} opacity={name}
      >
        ferry
      </text>

      {text.tagline.map((part, index) => {
        const at = cueFrame(TAGLINE_CUES[index]);
        const land = easeOut(ramp(frame, at, at + eighths(0.8)));
        return (
          <text
            key={part} x={centers[index]} y={792 - (1 - land) * 15}
            textAnchor="middle" fontFamily={FONT.hand} fontSize={lang === "zh" ? 61 : 60}
            fill={C.ink} opacity={land}
          >
            {part}
          </text>
        );
      })}
    </svg>
  );
};
