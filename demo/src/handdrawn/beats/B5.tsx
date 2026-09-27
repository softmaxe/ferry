import { useId } from "react";
import { lerp, ramp, smooth } from "../anim";
import { Crossing, CROSSING_WINDOW, crossingState, type CrossingTiming } from "../components/Crossing";
import { Ferri } from "../components/Ferri";
import { Harbor, pierX, projectHarborPoint } from "../components/Harbor";
import { Mac, MacScreen, MenuBar } from "../components/Mac";
import { RedPenTick } from "../components/RedPen";
import { WindowFrame } from "../components/WindowFrame";
import { RoughDrawing } from "../rough";
import { C, FONT } from "../theme";
import { cueFrame, eighths, FPS, move } from "../timeline";
import type { BeatProps } from "./types";

const TRIP = move("b5.enter");
const COMMAND = `ferry --no-follow --verbose ${TRIP.to}`;
// Recorded in the original P6 demo. Only wrapping changes; src/ferry.m prints one line.
const OUTPUT = [
  "window 12877 (via accessibility) -> space 4 (id 1):",
  "moved in 3.4 ms, not followed, total 106.9 ms",
];
const SOURCE = { x: -500, y: 156, zoom: 0.8 };
const INSET = { x: 1300, y: 150, w: 540, h: 390 };
const DESTINATION = { camera: 4, zoom: 1.1 };

const TerminalBody = ({ typed, output, caret }: { typed: string; output: boolean; caret: boolean }) => (
  <g fontFamily={FONT.mono} style={{ fontVariantLigatures: "none" }}>
    <text x={24} y={67} fill={C.whitePaper} fontSize={25}>
      <tspan fill={C.coral}>$ </tspan>
      <tspan>{typed.slice(0, 6)}</tspan>
      <tspan fill={C.coral}>{typed.slice(6, 17)}</tspan>
      <tspan>{typed.slice(17)}</tspan>
      {caret && <tspan fill={C.coral}>▍</tspan>}
    </text>
    {output && OUTPUT.map((line, index) => <text key={line} x={24} y={151 + index * 47} fontSize={20} fill={C.whitePaper}>{line}</text>)}
    {output && <path d="M228 214 h144" stroke={C.coral} strokeWidth={3} opacity={0.7} />}
  </g>
);

/** The main Space never follows; the destination inset owns the terminal after it leaves. */
export const B5 = ({ frame, beat, lang, text }: BeatProps) => {
  const clipId = `destination-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const enter = cueFrame("b5.enter");
  const sail = cueFrame("b5.sail");
  const insetAt = cueFrame("b5.inset");
  const handoff = insetAt + eighths(3);
  const timing: CrossingTiming = { board: enter, sail, dock: cueFrame("b5.dock"), unload: cueFrame("b5.arrival") + eighths(1) };
  const state = crossingState(frame, TRIP.from, TRIP.to, TRIP.follow, timing);
  const departure = smooth(ramp(frame, enter, sail));
  const reveal = smooth(ramp(frame, cueFrame("b5.verbose"), cueFrame("b5.verbose") + eighths(3)));
  const destinationOwnsWindow = frame >= handoff;
  const sourceOwnsWindow = !destinationOwnsWindow;
  const insetVisible = frame >= insetAt;
  const insetProgress = ramp(frame, insetAt, insetAt + eighths(1));
  const callFocused = destinationOwnsWindow;
  const typedLength = Math.floor(ramp(frame, cueFrame("b5.type"), enter - eighths(0.5)) * COMMAND.length);
  const typed = frame >= enter ? COMMAND : COMMAND.slice(0, typedLength);
  const mac = {
    x: lerp(145, 96, reveal), y: lerp(110, 225, reveal),
    w: lerp(1180, 660, reveal), h: lerp(684.75, 392.25, reveal),
  };
  const pane = {
    x: lerp(INSET.x, 830, reveal), y: lerp(INSET.y, 118, reveal),
    w: lerp(INSET.w, 1004, reveal), h: lerp(INSET.h, 650, reveal),
  };
  const sourcePoint = projectHarborPoint({ x: state.windowX, y: state.windowY }, TRIP.from, SOURCE.zoom);
  const destinationPoint = projectHarborPoint({ x: state.windowX, y: state.windowY }, DESTINATION.camera, DESTINATION.zoom);
  const sourceWindow = {
    x: lerp(969, SOURCE.x + sourcePoint.x, departure),
    y: lerp(550, SOURCE.y + sourcePoint.y, departure),
    scale: lerp(0.85, state.windowScale * SOURCE.zoom, departure),
  };
  const destinationWindow = {
    x: lerp(INSET.x + destinationPoint.x * INSET.w / 1920, 1332, reveal),
    y: lerp(INSET.y + 24 + destinationPoint.y * INSET.w / 1920, 453, reveal),
    scale: lerp(state.windowScale * DESTINATION.zoom * INSET.w / 1920, 1.24, reveal),
  };
  const terminal = (position: { x: number; y: number; scale: number }) => <WindowFrame
    x={position.x - CROSSING_WINDOW.w / 2} y={position.y - CROSSING_WINDOW.h / 2} {...CROSSING_WINDOW}
    scale={position.scale} kind="terminal" title={text.windows.terminal} lang={lang} frame={frame} seed={850}>
    <TerminalBody typed={typed} output={frame >= cueFrame("b5.verbose")} caret={frame < enter} />
  </WindowFrame>;

  return <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
    <Mac box={mac} frame={frame}>
      <MacScreen space={TRIP.from} menuSpace={state.menuSpace} app={callFocused ? text.windows.call : text.windows.terminal} clock={beat.clock} frame={frame}>
        <WindowFrame x={95} y={112} w={1320} h={760} title={text.windows.call} kind="call" lang={lang} frame={frame} focused={callFocused} seed={867} />
      </MacScreen>
    </Mac>
    {(frame < enter || reveal >= 1) && <Ferri x={lerp(1370, 696, reveal)} y={lerp(832, 766, reveal)} pose={frame < enter ? "typing" : "pleased"} frame={frame} fps={FPS} scale={0.73} look={[-0.7, -0.2]} />}
    {frame >= enter && !destinationOwnsWindow && <g transform={`translate(${SOURCE.x + 960} ${SOURCE.y + 470}) scale(${SOURCE.zoom}) translate(${-pierX(TRIP.from)} -470)`}>
      <Crossing frame={frame} lang={lang} title={text.windows.terminal} kind="terminal" {...TRIP} timing={timing} showWindow={false} />
    </g>}
    {sourceOwnsWindow && terminal(sourceWindow)}
    {insetVisible && <g data-destination-inset="true" opacity={insetProgress}>
      <defs><clipPath id={clipId}><rect x={pane.x} y={pane.y + 20} width={pane.w} height={pane.h - 20} /></clipPath></defs>
      <rect x={pane.x} y={pane.y} width={pane.w} height={pane.h} fill={C.whitePaper} opacity={1 - reveal} />
      {reveal < 1 && <g opacity={1 - reveal} clipPath={`url(#${clipId})`}>
        <g transform={`translate(${INSET.x} ${INSET.y + 24}) scale(${INSET.w / 1920})`}>
          <Harbor frame={frame} lang={lang} spaces={[TRIP.to]} activeSpace={TRIP.to} cameraSpace={DESTINATION.camera} zoom={DESTINATION.zoom}>
            {destinationOwnsWindow && <Crossing frame={frame} lang={lang} title={text.windows.terminal} kind="terminal" {...TRIP} timing={timing} showWindow={false} />}
          </Harbor>
        </g>
      </g>}
      <RoughDrawing seed={882} deps={[pane.x, pane.y, pane.w, pane.h]} options={{ stroke: C.pencil, strokeWidth: 2, roughness: 1.2 }} progress={1 - reveal}
        build={(g, options) => [g.rectangle(pane.x, pane.y, pane.w, pane.h, options)]} />
      {destinationOwnsWindow && <>
        <g transform={`translate(${pane.x} ${pane.y}) scale(${pane.w / 1920})`}>
          <MenuBar app={text.windows.terminal} clock={beat.clock} space={TRIP.to} />
        </g>
        {terminal(destinationWindow)}
      </>}
    </g>}
    {text.badges.map((badge, index) => {
      const start = cueFrame(`b5.badge${index + 1}`);
      if (frame < start) return null;
      const x = [170, 790, 1355][index];
      return <g key={badge}>
        <RedPenTick x={x} y={800} size={59} progress={ramp(frame, start, start + eighths(1))} seed={890 + index} />
        <text x={x + 87} y={844} fontFamily={FONT.hand} fontSize={38} fill={C.navyInk}>{badge}</text>
      </g>;
    })}
  </svg>;
};
