import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFonts } from "../fonts";
import { Paper } from "../Paper";
import { RoughDrawing } from "../rough";
import { C, FONT } from "../theme";
import { Ferri, type FerriPose } from "./Ferri";

loadFonts();

const poses: FerriPose[] = ["typing", "scratch", "pleased", "wave", "steering"];
const labels = ["Typing", "Head scratch", "Pleased", "Wave", "Steering"];

/** All five story poses, followed by the two smallest intended placements. */
export const FerriSheet = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Paper />
      <svg width="100%" height="100%" viewBox="0 0 1920 1080" style={{ position: "absolute" }}>
        <g fontFamily={FONT.hand} fill={C.navyInk}>
          <text x={104} y={135} fontSize={72}>Ferri</text>
          <text x={104} y={190} fontSize={30} fill={C.pencil}>A little window. A helpful captain.</text>
          {poses.map((pose, index) => (
            <g key={pose}>
              <Ferri x={224 + index * 362} y={506} scale={1.12} pose={pose} frame={frame} fps={fps} seed={17 + index} />
              <text x={224 + index * 362} y={565} fontSize={32} textAnchor="middle">{labels[index]}</text>
            </g>
          ))}
          <RoughDrawing seed={82} options={{ stroke: C.pencil, strokeWidth: 1.4, roughness: 0.7 }} build={(g, o) => [g.line(104, 618, 1816, 618, o)]} />
          <text x={104} y={699} fontSize={36}>At the Mac</text>
          <text x={1156} y={699} fontSize={36}>On deck</text>
          <text x={104} y={991} fontSize={26} fill={C.pencil}>Body width 146 px</text>
          <text x={1156} y={991} fontSize={26} fill={C.pencil}>Body width 72 px</text>
        </g>

        <Ferri x={257} y={918} scale={0.85} pose="typing" frame={frame} fps={fps} />
        <RoughDrawing seed={90} options={{ stroke: C.graphite, strokeWidth: 2.5, roughness: 0.8 }} build={(g, o) => [
          g.rectangle(450, 716, 345, 188, { ...o, fill: C.whitePaper, fillStyle: "solid" }),
          g.rectangle(465, 731, 315, 153, o),
          g.line(619, 905, 619, 927, o), g.line(578, 927, 661, 927, o),
          g.polygon([[370, 859], [440, 859], [456, 882], [360, 882]], { ...o, fill: C.paperShade, fillStyle: "solid" }),
          g.line(104, 932, 937, 932, o),
        ]} />
        <RoughDrawing seed={91} options={{ stroke: C.pencil, strokeWidth: 1.4, roughness: 0.5 }} build={(g, o) => [
          ...[0, 1, 2].map((row) => g.line(371 - row * 2, 864 + row * 5, 439 + row * 3, 864 + row * 5, o)),
          ...[0, 1, 2, 3, 4, 5].map((col) => g.line(377 + col * 11, 863, 375 + col * 13, 879, o)),
        ]} />
        <text x={623} y={811} textAnchor="middle" fontFamily={FONT.ui} fontSize={27} fill={C.navy}>Ferry Window to Space 2</text>

        <RoughDrawing seed={99} options={{ stroke: C.navyInk, strokeWidth: 2.3, roughness: 0.8 }} build={(g, o) => [
          g.polygon([[1185, 880], [1761, 880], [1696, 938], [1273, 938]], { ...o, fill: C.navy, fillStyle: "hachure", hachureGap: 6 }),
          g.rectangle(1540, 801, 120, 79, { ...o, fill: C.whitePaper, fillStyle: "solid" }),
          g.line(1540, 822, 1660, 822, o),
        ]} />
        <Ferri x={1373} y={880} scale={0.42} pose="steering" frame={frame} fps={fps} seed={23} />
        <RoughDrawing seed={100} options={{ stroke: C.sea, strokeWidth: 2.2, roughness: 0.8 }} build={(g, o) => [g.curve([[1147, 947], [1260, 951], [1430, 946], [1620, 951], [1800, 945]], o)]} />
      </svg>
    </AbsoluteFill>
  );
};
