import type { ReactNode } from "react";
import { lerp, ramp } from "../anim";
import type { Lang } from "../copy";
import { FPS } from "../timeline";
import { Boat, DECK, Wake } from "./Boat";
import { Ferri } from "./Ferri";
import { pierX } from "./Harbor";
import { WindowFrame, type WindowKind } from "./WindowFrame";

export const CROSSING_WINDOW = { w: 720, h: 440 };
export type CrossingTiming = { board: number; sail: number; dock: number; unload: number };
const ease = (value: number) => value * value * (3 - 2 * value);
const progressAt = (frame: number, start: number, end: number) => ease(ramp(frame, start, Math.max(start + 1, end)));

/** The camera and the menu use the same Space coordinate during Follow. */
export const crossingState = (frame: number, from: number, to: number, follow: boolean, timing: CrossingTiming) => {
  const board = progressAt(frame, timing.board, timing.sail);
  const progress = progressAt(frame, timing.sail, timing.dock);
  const unload = progressAt(frame, timing.dock, timing.unload);
  const direction = Math.sign(to - from);
  const boatX = lerp(pierX(from) + direction * 260, pierX(to) - direction * 260, progress);
  const boatY = 800 + Math.sin(frame / 13) * 5 * Math.sin(Math.PI * progress);
  const boatScale = 0.94;
  const cargoScale = 0.70;
  const cargoX = boatX + (direction < 0 ? -50 : 50) * boatScale;
  const cargoY = boatY + DECK.y * boatScale - CROSSING_WINDOW.h * cargoScale / 2;
  const parkedY = 630 - CROSSING_WINDOW.h / 2;
  const windowX = unload > 0 ? lerp(cargoX, pierX(to), unload) : lerp(pierX(from), cargoX, board);
  const windowY = unload > 0 ? lerp(cargoY, parkedY, unload) - Math.sin(unload * Math.PI) * 54
    : lerp(parkedY, cargoY, board) - Math.sin(board * Math.PI) * 170;
  const windowScale = unload > 0 ? lerp(cargoScale, 1, unload) : lerp(1, cargoScale, board);
  const cameraSpace = follow ? lerp(from, to, progress) : from;
  return { progress, cameraSpace, menuSpace: Math.round(cameraSpace), windowX, windowY, windowScale,
    boatX, boatY, boatScale, flip: direction < 0 };
};

/** The transferred window is mounted once, separate from the boat shell. */
export const Crossing = ({ frame, lang, title, kind, from, to, follow, timing, showBoat = true, showWindow = true, windowBody }: {
  frame: number; lang: Lang; title: string; kind: WindowKind; from: number; to: number;
  follow: boolean; timing: CrossingTiming; showBoat?: boolean; showWindow?: boolean; windowBody?: ReactNode;
}) => {
  const state = crossingState(frame, from, to, follow, timing);
  return <g>
    {showBoat && <>
      {state.progress > 0 && state.progress < 1 && <Wake x={state.boatX - (state.flip ? -1 : 1) * 355} y={state.boatY - 18} length={240} frame={frame} flip={state.flip} opacity={Math.sin(Math.PI * state.progress) * 0.7} />}
      <Boat x={state.boatX} y={state.boatY} scale={state.boatScale} flip={state.flip} frame={frame} hideCabin
        captain={<Ferri x={0} y={0} pose="steering" frame={frame} fps={FPS} scale={0.68} flip={state.flip} />} />
    </>}
    {showWindow && <WindowFrame x={state.windowX - CROSSING_WINDOW.w / 2} y={state.windowY - CROSSING_WINDOW.h / 2}
      {...CROSSING_WINDOW} scale={state.windowScale} title={title} kind={kind} lang={lang} frame={frame} seed={850}>
      {windowBody}
    </WindowFrame>}
  </g>;
};
