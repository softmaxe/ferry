import { pencilSeed } from "../anim";
import { RoughDrawing } from "../rough";
import { C, FONT, SPACE_COLORS } from "../theme";

/** The Option glyph is drawn explicitly because the WenKai subset does not contain it. */
export const StickyNote = ({ x, y, space, frame, width = 220, progress = 1, emphasis = 0 }: {
  x: number; y: number; space: number; frame: number; width?: number; progress?: number; emphasis?: number;
}) => {
  const scale = width / 220 * (0.92 + Math.min(1, progress) * 0.08 + emphasis * 0.025);
  const angle = [-4, 2, -2, 3, -3][space - 1];
  return <g role="img" aria-label={`Option ${space}`} opacity={Math.min(1, progress)} transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
    <path d="M-110 -72 H110 V48 L89 72 H-110Z" fill={SPACE_COLORS[space].wall} />
    <path d="M89 48 H110 L89 72Z" fill={SPACE_COLORS[space].deep} opacity={0.8} />
    <path d="M-109 -61 H109" stroke={SPACE_COLORS[space].deep} strokeWidth={21} opacity={0.35} />
    <RoughDrawing seed={pencilSeed(970 + space, frame)} progress={progress} options={{ stroke: emphasis > 0 ? C.coralDeep : C.graphite, strokeWidth: emphasis > 0 ? 4 : 2.7, roughness: 1, bowing: 0.6 }} build={(g, o) => [
      g.polygon([[-110, -72], [110, -72], [110, 48], [89, 72], [-110, 72]], o),
      g.linearPath([[89, 72], [89, 48], [110, 48]], { ...o, strokeWidth: 1.5 }),
    ]} />
    <path d="M-75 -19 H-61 L-37 17 H-13 M-75 17 H-55 M-47 -19 H-13" fill="none" stroke={C.navyInk} strokeWidth={5} strokeLinejoin="round" strokeLinecap="square" />
    <text x={43} y={27} textAnchor="middle" fontFamily={FONT.hand} fontSize={72} fill={C.navyInk}>{space}</text>
  </g>;
};
