import { lerp, ramp } from "../anim";
import { Crossing, crossingState, type CrossingTiming } from "../components/Crossing";
import { Harbor, pierX, projectHarborPoint } from "../components/Harbor";
import { MenuBar } from "../components/Mac";
import { RedPenTick } from "../components/RedPen";
import { StickyNote } from "../components/StickyNote";
import { WindowFrame, type WindowKind } from "../components/WindowFrame";
import { RoughDrawing } from "../rough";
import { C } from "../theme";
import { cueFrame, eighths, move } from "../timeline";
import type { BeatProps } from "./types";

const SPACES = [1, 2, 3, 4, 5];
const RESIDENTS: WindowKind[] = ["chat", "code", "design", "terminal", "call"];
const smooth = (value: number) => value * value * (3 - 2 * value);
const PLANS = [1, 2, 3].map((index) => {
  const board = cueFrame(`b4.move${index}`);
  const unload = cueFrame(`b4.arrival${index}`);
  const timing: CrossingTiming = { board, sail: board + eighths(1), dock: unload - eighths(1), unload };
  return { ...move(`b4.move${index}`), timing };
});

/** One docs window remains owned by one Crossing through the whole montage. */
export const B4 = ({ frame, beat, lang, text }: BeatProps) => {
  const current = PLANS.reduce((latest, plan, index) => frame >= plan.timing.board ? index : latest, 0);
  const plan = PLANS[current];
  const state = crossingState(frame, plan.from, plan.to, plan.follow, plan.timing);
  const zoomIn = smooth(ramp(frame, cueFrame("b4.note5") + eighths(2), PLANS[0].timing.board));
  const cameraSpace = lerp(3, state.cameraSpace, zoomIn);
  const zoom = lerp(0.25, 0.72, zoomIn);
  const harborY = 140 * (1 - zoomIn);
  const notesOpacity = 1 - ramp(frame, cueFrame("b4.note5") + eighths(2), PLANS[0].timing.board - eighths(1));
  const press = 1 - ramp(frame, plan.timing.board, plan.timing.board + eighths(1.5));
  const arrived = frame >= plan.timing.unload;

  return <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
    <g transform={`translate(0 ${harborY})`}>
      <Harbor frame={frame} lang={lang} cameraSpace={cameraSpace} zoom={zoom} activeSpace={state.menuSpace}>
        {SPACES.map((space) => {
          const kind = RESIDENTS[space - 1];
          const centerX = pierX(space) + 430;
          const screenX = projectHarborPoint({ x: centerX, y: 520 }, cameraSpace, zoom).x;
          if (screenX < -150 * zoom || screenX > 1920 + 150 * zoom) return null;
          return <WindowFrame key={space} x={centerX - 150} y={410} w={300} h={220} kind={kind} title={text.windows[kind]} lang={lang} frame={frame} focused={false} seed={880 + space} />;
        })}
        <Crossing frame={frame} lang={lang} kind="docs" title={text.windows.docs} {...plan} showBoat={frame >= PLANS[0].timing.board} />
        {arrived && <RedPenTick x={state.windowX + 390} y={225} size={93} progress={ramp(frame, plan.timing.unload, plan.timing.unload + eighths(1))} seed={1010 + current} />}
      </Harbor>
    </g>

    {notesOpacity > 0 && <g opacity={notesOpacity}>
      {SPACES.map((space) => {
        const progress = smooth(ramp(frame, cueFrame(`b4.note${space}`), cueFrame(`b4.note${space}`) + eighths(1)));
        if (progress <= 0) return null;
        const anchor = projectHarborPoint({ x: pierX(space), y: 70 }, cameraSpace, zoom);
        const x = anchor.x;
        return <g key={space}>
          <RoughDrawing seed={990 + space} progress={progress} deps={[x, anchor.y, harborY]} options={{ stroke: C.pencil, strokeWidth: 2, roughness: 1.1 }} build={(g, o) => [
            g.curve([[x, 382], [x - 14, 445], [x, anchor.y + harborY - 8]], o),
          ]} />
          <StickyNote x={x} y={307} space={space} frame={frame} width={214} progress={progress} />
        </g>;
      })}
    </g>}

    {frame >= PLANS[0].timing.board && <StickyNote x={1678} y={204} space={plan.to} frame={frame} width={178} emphasis={press} />}
    <g transform="translate(154 72) scale(0.84)"><MenuBar app={text.windows.docs} clock={beat.clock} space={state.menuSpace} /></g>
  </svg>;
};
