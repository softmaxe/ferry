import { lerp, ramp } from "../anim";
import { Crossing, CROSSING_WINDOW, crossingState, type CrossingTiming } from "../components/Crossing";
import { Ferri } from "../components/Ferri";
import { Harbor, projectHarborPoint } from "../components/Harbor";
import { Mac, MacScreen, MenuBar, screenBox } from "../components/Mac";
import { Raycast } from "../components/Raycast";
import { RedPenTick } from "../components/RedPen";
import { WindowFrame } from "../components/WindowFrame";
import { cueFrame, eighths, FPS, move } from "../timeline";
import type { BeatProps } from "./types";

const MAC = { x: 300, y: 115, w: 1320, h: 763.5 };
const SCREEN = screenBox(MAC);
const DESKTOP_SCALE = SCREEN.w / 1920;
const DOCS = { x: 960, y: 557, scale: 1.34 };
const CAMERA = 1.5;
const ZOOM = 0.72;
const smooth = (progress: number) => progress * progress * (3 - 2 * progress);

export const B3 = ({ frame, beat, lang, text }: BeatProps) => {
  const trip = move("b3.enter");
  const board = cueFrame("b3.board");
  const pushIn = cueFrame("b3.pushIn");
  const timing: CrossingTiming = { board, sail: cueFrame("b3.sail"), dock: cueFrame("b3.dock"), unload: cueFrame("b3.tick") };
  const state = crossingState(frame, trip.from, trip.to, trip.follow, timing);
  const pull = smooth(ramp(frame, cueFrame("b3.pullOut"), board));
  const push = smooth(ramp(frame, pushIn, pushIn + eighths(2)));
  const harbor = pull * (1 - push);
  const desktop = 1 - harbor;
  const space = frame < timing.dock ? trip.from : trip.to;
  const desktopWindow = {
    x: SCREEN.x + DOCS.x * DESKTOP_SCALE,
    y: SCREEN.y + DOCS.y * DESKTOP_SCALE,
    scale: DOCS.scale * DESKTOP_SCALE,
  };
  const harborWindow = projectHarborPoint({ x: state.windowX, y: state.windowY }, CAMERA, ZOOM);
  const windowOnHarbor = frame >= board && frame < pushIn;
  const windowX = lerp(desktopWindow.x, harborWindow.x, harbor);
  const windowY = lerp(desktopWindow.y, harborWindow.y, harbor);
  const windowScale = lerp(desktopWindow.scale, state.windowScale * ZOOM, harbor);

  return <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
    {harbor > 0 && <g opacity={harbor}>
      <Harbor frame={frame} lang={lang} spaces={[trip.from, trip.to]} activeSpace={state.menuSpace} cameraSpace={CAMERA} zoom={ZOOM}>
        <Crossing frame={frame} lang={lang} kind="docs" title={text.windows.docs} {...trip} timing={timing} showWindow={windowOnHarbor} showBoat={frame >= cueFrame("b3.pullOut")} />
        {frame >= cueFrame("b3.tick") && <RedPenTick x={state.windowX + 390} y={220} size={108} progress={ramp(frame, cueFrame("b3.tick"), cueFrame("b3.tick") + eighths(1))} />}
      </Harbor>
    </g>}
    {desktop > 0 && <g opacity={desktop}>
      <Mac box={MAC} frame={frame}>
        <MacScreen space={space} app={text.windows.docs} clock={beat.clock} frame={frame} />
      </Mac>
      <Ferri x={192} y={878} scale={0.83} pose={frame < cueFrame("b3.enter") ? "typing" : "pleased"} frame={frame} fps={FPS} look={[0.8, -0.2]} />
    </g>}
    {!windowOnHarbor && <WindowFrame x={windowX - CROSSING_WINDOW.w / 2} y={windowY - CROSSING_WINDOW.h / 2}
      {...CROSSING_WINDOW} scale={windowScale} title={text.windows.docs} kind="docs" lang={lang} frame={frame} seed={850} />}
    {harbor >= 1 && <g transform="translate(154 72) scale(0.84)"><MenuBar app={text.windows.docs} clock={beat.clock} space={state.menuSpace} /></g>}
    {frame < board && <svg x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} viewBox="0 0 1920 1080" overflow="hidden">
      <Raycast frame={frame} openAt={cueFrame("b3.open")} typeAt={cueFrame("b3.type")} selectAt={cueFrame("b3.select")}
        enterAt={cueFrame("b3.enter")} closeAt={cueFrame("b3.enter") + eighths(2)} space={trip.to} />
    </svg>}
  </svg>;
};
