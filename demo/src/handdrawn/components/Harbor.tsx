import type { ReactNode } from "react";
import { pencilSeed } from "../anim";
import { copy, type Lang } from "../copy";
import { RoughDrawing } from "../rough";
import { C, FONT, SPACE_COLORS } from "../theme";

export const PIER_GAP = 1340;
export const pierX = (space: number) => 960 + (space - 1) * PIER_GAP;
export const projectHarborPoint = (point: { x: number; y: number }, cameraSpace: number, zoom = 0.72) => ({
  x: 960 + (point.x - pierX(cameraSpace)) * zoom,
  y: 470 + (point.y - 470) * zoom,
});

/** World coordinates are shared by Piers, their windows and the ferry. */
export const Harbor = ({ frame, lang, spaces = [1, 2, 3, 4, 5], activeSpace = 1, cameraSpace = 1, zoom = 0.72, children }: {
  frame: number; lang: Lang; spaces?: number[]; activeSpace?: number;
  cameraSpace?: number; zoom?: number; children?: ReactNode;
}) => {
  const left = pierX(Math.min(...spaces)) - 1100;
  const right = pierX(Math.max(...spaces)) + 1100;
  return <g transform={`translate(960 470) scale(${zoom}) translate(${-pierX(cameraSpace)} -470)`}>
    <path d={`M${left} 667 Q${(left + right) / 2} 629 ${right} 670 V960 Q${(left + right) / 2} 875 ${left} 931Z`} fill={C.seaLight} opacity={0.065} />
    <RoughDrawing seed={pencilSeed(920, frame)} deps={[left, right]} options={{ stroke: C.sea, strokeWidth: 2, roughness: 1.2 }} build={(g, o) => [
      g.curve([[left, 690], [left + 730, 681], [(left + right) / 2, 700], [right - 730, 680], [right, 696]], o),
      ...Array.from({ length: 12 }, (_, i) => {
        const x = left + (right - left) * i / 12;
        const y = 760 + (i % 3) * 59;
        return g.curve([[x, y], [x + 77, y - 5], [x + 168, y + 2], [x + 257, y - 2]], o);
      }),
    ]} />
    {spaces.map((space) => <Pier key={space} space={space} lang={lang} frame={frame} active={space === activeSpace} />)}
    {children}
  </g>;
};

const Pier = ({ space, lang, frame, active }: { space: number; lang: Lang; frame: number; active: boolean }) => {
  const x = pierX(space);
  const color = SPACE_COLORS[space];
  const stroke = { stroke: C.graphite, strokeWidth: 3, roughness: 1.1, bowing: 0.6 };
  const label = lang === "zh" ? `${space} 号码头` : `${copy[lang].pier} ${space}`;
  return <g>
    <path d={`M${x - 430} 613 Q${x - 230} 606 ${x} 613 Q${x + 241} 606 ${x + 430} 613 V654 H${x - 430}Z`} fill={C.paperShade} />
    <RoughDrawing seed={710 + space} deps={[x]} options={{ stroke: "none", fill: C.pencil, fillStyle: "hachure", hachureGap: 7, fillWeight: 1.3, hachureAngle: 0 }} build={(g, o) => [
      g.rectangle(x - 425, 620, 850, 31, o),
      g.rectangle(x - 347, 651, 28, 137, o), g.rectangle(x + 319, 651, 28, 137, o),
    ]} />
    <RoughDrawing seed={pencilSeed(730 + space, frame)} deps={[x]} options={stroke} build={(g, o) => [
      g.rectangle(x - 430, 614, 860, 40, o), g.line(x - 430, 631, x + 430, 631, o),
      g.line(x - 430, 641, x + 430, 641, o),
      g.rectangle(x - 347, 654, 28, 134, o), g.rectangle(x + 319, 654, 28, 134, o),
      g.line(x - 116, 159, x - 116, 614, o), g.line(x + 116, 159, x + 116, 614, o),
    ]} />
    <rect x={x - 151} y={70} width={302} height={90} fill={color.wall} opacity={active ? 0.9 : 0.62} />
    <RoughDrawing seed={pencilSeed(750 + space, frame)} deps={[x]} options={{ ...stroke, stroke: C.navyInk, strokeWidth: active ? 3.5 : 2.5 }} build={(g, o) => [g.rectangle(x - 151, 70, 302, 90, o)]} />
    <text x={x} y={132} textAnchor="middle" fontFamily={FONT.hand} fontSize={lang === "zh" ? 45 : 52} fill={C.navyInk}>{label}</text>
    <path d={`M${x - 126} 168 h252`} stroke={color.deep} strokeWidth={6} opacity={0.8} />
  </g>;
};
