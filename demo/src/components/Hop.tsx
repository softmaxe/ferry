import { bob, ease, keys, lerp } from "../anim";
import type { WinRect } from "../layouts";
import { C } from "../theme";
import { eighths } from "../timeline";
import type { TripModel } from "../trip";
import { AppWindow } from "./AppWindow";
import { Boat, onDeck } from "./Boat";
import { Dock, MenuBar, Wallpaper } from "./Desktop";

// A hotkey Trip, drawn on the 1920×1080 screen: the window boards a boat that rises on a strip
// of sea, the Spaces slide past (or, without Follow, the boat leaves on its own), and the window
// steps off at its Landing. The Trip model says when each
// phase runs, which Space the screen shows, where every window rests and which is focused;
// this only draws the boat, the sea and the window on its way between resting rectangles.

const BOAT_SCALE = 0.55;
const SEA_H = 150;

type Props = {
  frame: number;
  /** The scene's Trip model; its active Trip is drawn, or nothing when none is active. */
  trips: TripModel;
  clock: string;
};

export const Hop = ({ frame: f, trips, clock }: Props) => {
  const plan = trips.activeTrip(f);
  if (!plan) return null;
  const { lift, travel, unload } = plan.phases;
  const { lift: liftT, travel: travelT, unload: unloadT } = plan.progress;
  const rise = plan.follow
    ? keys(f, [[lift[0], 0], [lift[1], 1], [unload[0] + eighths(0.5), 1], [unload[1] + eighths(0.3), 0]], ease.inOut)
    : keys(f, [[lift[0], 0], [lift[1], 1], [travel[1], 1], [unload[0] + eighths(0.5), 0]], ease.inOut);
  const shown = trips.screenSpace(f);
  const focused = trips.focusedWindow(f);

  const n = Math.abs(plan.to - plan.from);
  const dir = Math.sign(plan.to - plan.from) || 1;
  const q = plan.follow ? travelT * n : 0;

  const waterTop = 1080 - SEA_H * rise;
  const b = bob(f, 6, 60);
  const boatX = plan.follow ? 960 + Math.sin(travelT * Math.PI) * 60 * dir : lerp(960, 2500, keys(f, [[travel[0], 0], [travel[1], 1]], ease.in));
  const keel = waterTop + 44 + b.y;
  const deck = onDeck(boatX, keel, BOAT_SCALE, plan.window.rect);
  const speed = plan.follow ? Math.sin(travelT * Math.PI) : keys(f, [[travel[0], 0], [travel[0] + eighths(0.8), 1]], ease.out);

  const src = plan.window.rect;
  const dst = plan.landing;
  let win: WinRect & { r: number } | null = null;
  if (f >= lift[0] && (plan.follow ? unloadT < 1 : true)) {
    if (f < lift[1]) {
      win = { x: lerp(src.x, deck.x, liftT), y: lerp(src.y, deck.y, liftT), w: lerp(src.w, deck.w, liftT), h: lerp(src.h, deck.h, liftT), r: liftT * 3 };
    } else if (!plan.follow || f < unload[0]) {
      win = { ...deck, r: 3 + b.r };
    } else {
      win = { x: lerp(deck.x, dst.x, unloadT), y: lerp(deck.y, dst.y, unloadT), w: lerp(deck.w, dst.w, unloadT), h: lerp(deck.h, dst.h, unloadT), r: 3 * (1 - unloadT) };
    }
  }

  const spaces: { space: number; x: number }[] = [];
  for (let j = 0; j <= n; j++) {
    const x = dir * (j - q) * 1920;
    if (Math.abs(x) < 1920) spaces.push({ space: plan.from + dir * j, x });
  }

  return (
    <g>
      {spaces.map(({ space, x }) => (
        <g key={space} transform={`translate(${x} 0)`}>
          <Wallpaper space={space} frame={f} />
          {trips.windowsOn(space, f).map((w) => (
            <AppWindow key={w.id} kind={w.kind} {...w.rect} title={w.title} lines={w.lines} frame={f} focused={w.id === focused?.id} />
          ))}
        </g>
      ))}
      <MenuBar app={focused?.title ?? "Finder"} clock={clock} space={shown} />
      <g opacity={1 - Math.min(1, rise * 2)}>
        <Dock />
      </g>
      {rise > 0 && (
        <g>
          <path d={`M -10 ${waterTop} ${wave(waterTop, f, 0)} V 1100 H -10 Z`} fill={C.sea} opacity={0.96} />
          <Boat x={boatX} y={keel} rotate={b.r} scale={BOAT_SCALE} speed={speed} hideCabin={!!win && f >= lift[1] - eighths(0.2)} />
          {win && (
            <g transform={`rotate(${win.r} ${win.x + win.w / 2} ${win.y + win.h})`}>
              <g transform={`translate(${win.x} ${win.y}) scale(${win.w / plan.window.rect.w})`}>
                <AppWindow kind={plan.window.kind} x={0} y={0} w={plan.window.rect.w} h={plan.window.rect.h} title={plan.window.title} lines={plan.window.lines} frame={f} />
              </g>
            </g>
          )}
          <path d={`M -10 ${waterTop + 26} ${wave(waterTop + 26, f, 2)} V 1100 H -10 Z`} fill={C.navy} />
        </g>
      )}
      {rise <= 0 && win && (
        <g transform={`translate(${win.x} ${win.y}) scale(${win.w / plan.window.rect.w})`}>
          <AppWindow kind={plan.window.kind} x={0} y={0} w={plan.window.rect.w} h={plan.window.rect.h} title={plan.window.title} lines={plan.window.lines} frame={f} />
        </g>
      )}
    </g>
  );
};

const wave = (y: number, frame: number, phase: number) =>
  Array.from({ length: 42 }, (_, i) => `L ${i * 48} ${y + Math.sin(i * 0.7 + frame / 7 + phase) * 7}`).join(" ") + " L 1930 " + y;
