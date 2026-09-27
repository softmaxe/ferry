// Bezel hatching and keyboard construction adapted from animate-test's Computer.tsx at 965b4fe.
import { useId, type ReactNode } from "react";
import { pencilSeed } from "../anim";
import { RoughDrawing } from "../rough";
import { C, FONT, SPACE_COLORS } from "../theme";

export type Box = { x: number; y: number; w: number; h: number };
export const SCREEN_SIZE = { w: 1920, h: 1080 };
export const MAC_BEZEL = 24;
export const screenBox = (box: Box): Box => ({ x: box.x + MAC_BEZEL, y: box.y + MAC_BEZEL, w: box.w - MAC_BEZEL * 2, h: box.h - MAC_BEZEL * 2 });
const pencil = { stroke: C.graphite, strokeWidth: 3, roughness: 0.9, bowing: 0.5 };

/** A laptop lid and keyboard. Children use a 1920 by 1080 screen coordinate system. */
export const Mac = ({ box, children, frame = 0, seed = 301, lid = 1, opacity = 1 }: {
  box: Box; children?: ReactNode; frame?: number; seed?: number; lid?: number; opacity?: number;
}) => {
  const screen = screenBox(box);
  const open = Math.max(0, Math.min(1, lid));
  const bottom = box.y + box.h;
  const lineSeed = pencilSeed(seed, frame);
  return (
    <g opacity={opacity}>
      {open > 0 && <g transform={`translate(0 ${bottom}) scale(1 ${open}) translate(0 ${-bottom})`}>
        <rect x={box.x} y={box.y} width={box.w} height={box.h} fill={C.paperShade} />
        <RoughDrawing seed={seed} deps={[box.x, box.y, box.w, box.h]} options={{ stroke: "none", fill: C.pencil, fillStyle: "hachure", hachureGap: 8, fillWeight: 1.3, hachureAngle: 50 }} build={(g, o) => [
          g.rectangle(box.x, box.y, box.w, MAC_BEZEL, o), g.rectangle(box.x, bottom - MAC_BEZEL, box.w, MAC_BEZEL, o),
          g.rectangle(box.x, screen.y, MAC_BEZEL, screen.h, o), g.rectangle(box.x + box.w - MAC_BEZEL, screen.y, MAC_BEZEL, screen.h, o),
        ]} />
        <svg x={screen.x} y={screen.y} width={screen.w} height={screen.h} viewBox="0 0 1920 1080" overflow="hidden" preserveAspectRatio="none">
          <rect width={1920} height={1080} fill={C.whitePaper} />{children}
        </svg>
        <RoughDrawing seed={lineSeed} deps={[box.x, box.y, box.w, box.h]} options={pencil} build={(g, o) => [g.rectangle(box.x, box.y, box.w, box.h, o), g.rectangle(screen.x, screen.y, screen.w, screen.h, o)]} />
        <circle cx={box.x + box.w / 2} cy={box.y + 12} r={3} fill={C.graphite} />
      </g>}
      <RoughDrawing seed={lineSeed + 1} deps={[box.x, box.w, bottom]} options={{ ...pencil, fill: C.paperShade, fillStyle: "solid" }} build={(g, o) => [
        g.polygon([[box.x, bottom], [box.x + box.w, bottom], [box.x + box.w + 44, bottom + 50], [box.x - 44, bottom + 50]], o),
        g.line(box.x - 44, bottom + 50, box.x - 28, bottom + 61, o), g.line(box.x - 28, bottom + 61, box.x + box.w + 28, bottom + 61, o), g.line(box.x + box.w + 28, bottom + 61, box.x + box.w + 44, bottom + 50, o),
      ]} />
      <RoughDrawing seed={seed + 2} deps={[box.x, box.w, bottom]} options={{ stroke: C.pencil, strokeWidth: 1.4, roughness: 0.6 }} build={(g, o) => [
        ...[0, 1, 2].map((row) => g.line(box.x + 56 - row * 5, bottom + 9 + row * 8, box.x + box.w - 56 + row * 5, bottom + 9 + row * 8, o)),
        ...Array.from({ length: 17 }, (_, col) => g.line(box.x + 72 + col * (box.w - 144) / 16, bottom + 6, box.x + 64 + col * (box.w - 128) / 16, bottom + 29, o)),
        g.rectangle(box.x + box.w * 0.4, bottom + 34, box.w * 0.2, 10, o),
      ]} />
    </g>
  );
};

export const MenuBar = ({ app, clock, space }: { app: string; clock: string; space: number }) => (
  <g data-menu="true" fontFamily={FONT.ui} fontSize={29} fill={C.navyInk}>
    <rect width={1920} height={56} fill={C.whitePaper} opacity={0.88} />
    <path d="M28 16 h17 v24 H28z M33 10 h7" fill={C.navyInk} />
    <text data-menu-title="true" x={66} y={38} fontWeight={600}>{app}</text>
    <text x={430} y={37} fontSize={24} opacity={0.65}>File</text><text x={510} y={37} fontSize={24} opacity={0.65}>Edit</text><text x={587} y={37} fontSize={24} opacity={0.65}>View</text>
    <g transform="translate(1500 0)">
      <path d="M0 45 h155" stroke={SPACE_COLORS[space].deep} strokeWidth={5} />
      <text data-menu-space="true" x={0} y={38} fontWeight={600}>Space {space}</text>
    </g>
    <text x={1877} y={38} textAnchor="end">{clock}</text>
  </g>
);

export const MacScreen = ({ space, app, clock, frame = 0, menuSpace, children, overlay, offsetX = 0, showDock = true }: {
  space: number; app: string; clock: string; frame?: number; menuSpace?: number;
  children?: ReactNode; overlay?: ReactNode; offsetX?: number; showDock?: boolean;
}) => (
  <g>
    <g transform={`translate(${offsetX} 0)`}>
      <rect width={1920} height={1080} fill={C.whitePaper} />
      <rect width={1920} height={1080} fill={SPACE_COLORS[space].wall} opacity={0.48} />
      <RoughDrawing seed={500 + space} options={{ stroke: SPACE_COLORS[space].deep, strokeWidth: 2, roughness: 1.1 }} build={(g, o) => [
        g.curve([[0, 865], [410, 773], [972, 817], [1460, 707], [1920, 786]], o),
        g.curve([[0, 942], [590, 872], [1160, 921], [1920, 881]], o),
      ]} />
      {children}
    </g>
    {showDock && <g opacity={0.7}><rect x={638} y={1004} width={644} height={60} rx={14} fill={C.whitePaper} />{[C.coral, C.navy, C.seaLight, "#93CBAE", "#B7A7E3"].map((color, i) => <RoughDrawing key={color} seed={pencilSeed(600 + i, frame)} options={{ stroke: C.graphite, strokeWidth: 2, fill: color, fillStyle: "hachure", hachureGap: 5 }} build={(g, o) => [g.rectangle(720 + i * 106, 1013, 42, 42, o)]} />)}</g>}
    <MenuBar app={app} clock={clock} space={menuSpace ?? space} />
    {overlay}
  </g>
);

export const THUMB = { w: 260, h: 150, y: 96, gap: 58 };
export const thumbX = (space: number) => (1920 - 5 * THUMB.w - 4 * THUMB.gap) / 2 + (space - 1) * (THUMB.w + THUMB.gap);
export const thumbCenter = (space: number) => ({ x: thumbX(space) + THUMB.w / 2, y: THUMB.y + THUMB.h / 2 });

/** Mission Control thumbnails intentionally contain no duplicate window titles. */
export const SpaceStrip = ({ progress, frame = 0, highlightSpace = 0, highlight = 0 }: { progress: number; frame?: number; highlightSpace?: number; highlight?: number }) => (
  <g opacity={progress} transform={`translate(0 ${-200 * (1 - progress)})`}>
    <rect x={0} y={56} width={1920} height={252} fill={C.paperShade} opacity={0.72} />
    {[1, 2, 3, 4, 5].map((space) => {
      const x = thumbX(space);
      return <g key={space}>
        <rect x={x} y={THUMB.y} width={THUMB.w} height={THUMB.h} fill={SPACE_COLORS[space].wall} />
        <RoughDrawing seed={pencilSeed(520 + space, frame)} options={{ ...pencil, strokeWidth: space === highlightSpace && highlight > 0 ? 5 : 2.5, stroke: space === highlightSpace && highlight > 0 ? C.coral : C.graphite }} build={(g, o) => [g.rectangle(x, THUMB.y, THUMB.w, THUMB.h, o)]} />
        <rect x={x + 25} y={THUMB.y + 24} width={130} height={88} fill={C.whitePaper} opacity={0.85} />
        <rect x={x + 125} y={THUMB.y + 61} width={108} height={67} fill={SPACE_COLORS[space].deep} opacity={0.7} />
        <text x={x + THUMB.w / 2} y={THUMB.y + THUMB.h + 35} fontFamily={FONT.ui} fontSize={27} fill={C.navyInk} textAnchor="middle">Space {space}</text>
      </g>;
    })}
  </g>
);

/** Arrow tip or grab point in the parent coordinate system. */
export const Cursor = ({ x, y, scale = 1.4, grab = false }: { x: number; y: number; scale?: number; grab?: boolean }) => {
  const id = `cursor-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return <g id={id} transform={`translate(${x} ${y}) scale(${scale})`}>
    {grab ? <path d="M-5 8 L-5 0 Q-4 -5 1 -3 L6 2 V-9 Q6 -15 12 -13 L15 -5 Q19 -12 24 -5 Q31 -9 34 -2 L37 8 V19 Q33 31 22 31 H10 Q0 25 -5 8Z" fill={C.whitePaper} stroke={C.navyInk} strokeWidth={2.3} />
      : <path d="M0 0 L0 35 L10 26 L17 41 L23 37 L16 24 L29 24Z" fill={C.navyInk} stroke={C.whitePaper} strokeWidth={2.6} strokeLinejoin="round" />}
  </g>;
};
