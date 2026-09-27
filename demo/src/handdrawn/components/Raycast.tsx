import { ramp } from "../anim";
import { ferryCommandTitle } from "../copy";
import { RoughDrawing } from "../rough";
import { C, FONT } from "../theme";
import { eighths } from "../timeline";

/** The command's English title matches Raycast in either film language. */
export const Raycast = ({ frame, openAt, typeAt, selectAt, enterAt, closeAt, space = 2 }: {
  frame: number; openAt: number; typeAt: number; selectAt: number; enterAt: number; closeAt: number; space?: number;
}) => {
  if (frame < openAt || frame >= closeAt + eighths(1)) return null;
  const reveal = ramp(frame, openAt, openAt + eighths(1));
  const opacity = reveal * (1 - ramp(frame, closeAt, closeAt + eighths(1)));
  const typed = Math.floor(ramp(frame, typeAt, selectAt - eighths(0.5)) * 5);
  const selected = frame >= selectAt;
  const pressed = frame >= enterAt;
  const stroke = { stroke: C.graphite, strokeWidth: 3.5, roughness: 0.75, bowing: 0.4 };
  return <g opacity={opacity} transform={`translate(0 ${-12 * (1 - reveal)})`}>
    <rect width={1920} height={1080} fill={C.navyInk} opacity={0.08} />
    <rect x={284} y={222} width={1352} height={523} fill={C.whitePaper} />
    <RoughDrawing seed={881} options={stroke} build={(g, o) => [g.rectangle(284, 222, 1352, 523, o), g.line(284, 356, 1636, 356, o), g.line(284, 656, 1636, 656, o)]} />
    <path d="M341 261 l21 -21 65 65 -21 21z M329 293 l20 -20 34 34 -20 20z M373 248 l20 -20 34 34 -20 20z" fill={C.coral} />
    <text x={465} y={310} fontFamily={FONT.ui} fontSize={47} fill={C.navyInk}>{typed ? "ferry".slice(0, typed) : ""}</text>
    {!pressed && <path d={`M${466 + typed * 23} 267 v52`} stroke={C.navyInk} strokeWidth={3} opacity={frame % 60 < 39 ? 1 : 0.1} />}
    <text x={1540} y={303} textAnchor="end" fontFamily={FONT.ui} fontSize={26} fill={C.pencil}>Raycast</text>
    {typed > 0 && <>
      <rect x={310} y={386} width={1300} height={173} fill={selected ? C.navy : C.paperShade} opacity={selected ? 0.11 : 0.38} />
      {selected && <RoughDrawing seed={882} options={{ stroke: C.navy, strokeWidth: 2.3, roughness: 0.8 }} build={(g, o) => [g.rectangle(310, 386, 1300, 173, o)]} />}
      <path d="M350 458 h87 l-15 30 h-60z M375 451 v-32 h37 v32" fill={C.navy} stroke={C.navyInk} strokeWidth={2} />
      <text x={480} y={458} fontFamily={FONT.ui} fontSize={43} fontWeight={600} fill={C.navyInk}>{ferryCommandTitle(space)}</text>
      <text x={483} y={512} fontFamily={FONT.ui} fontSize={26} fill={C.pencil}>ferry</text>
    </>}
    <text x={328} y={709} fontFamily={FONT.ui} fontSize={26} fill={C.pencil}>Script Command</text>
    <g transform="translate(1389 678)">
      <rect width={204} height={47} fill={pressed ? C.coral : C.paperShade} opacity={pressed ? 0.8 : 0.65} />
      <RoughDrawing seed={883} options={{ ...stroke, strokeWidth: 2 }} build={(g, o) => [g.rectangle(0, 0, 204, 47, o)]} />
      <text x={77} y={33} textAnchor="middle" fontFamily={FONT.ui} fontSize={28} fill={C.navyInk}>Return</text>
      <path d="M179 11 v14 h-32 m8 -8 -8 8 8 8" fill="none" stroke={C.navyInk} strokeWidth={3} />
    </g>
  </g>;
};
