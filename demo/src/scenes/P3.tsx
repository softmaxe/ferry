import { FULL, bob, cuePop, cueProgress, ease, keys, lerp, viewportBetween, type Rect } from "../anim";
import { AppWindow } from "../components/AppWindow";
import { Boat, DECK, Wake } from "../components/Boat";
import { Harbor, WATER, cardRect, onCard, pierX } from "../components/Harbor";
import { Caption, Keycaps } from "../components/Overlays";
import { RaycastPanel } from "../components/Raycast";
import { Shot } from "../components/Shot";
import { SpaceView } from "../components/SpaceView";
import type { Copy } from "../copy";
import { ARRIVAL, SIZE, type WinRect } from "../layouts";
import { FRAMES_PER_EIGHTH, cueFrame, eighths, move } from "../timeline";
import type { SceneProps } from "./types";

// Raycast runs "Ferry Window to Space 2"; the harbor shows the docs window crossing to Space 2.
// WIDE frames the piers of both Spaces, so a trip to a farther Space needs a wider shot.

const CLOCK = "08:32";
const BOAT_SCALE = 0.34;
// Frames piers 1–3 so the crossing reads large; the other Spaces peek in from the right.
const WIDE: Rect = { x: -100, y: 200, w: 1250, h: 703.125 };

const TRIP = move("p3.enter");
const DOCS_BEFORE = { ...ARRIVAL[TRIP.from], ...SIZE.docs };
const DOCS_AFTER = { ...ARRIVAL[TRIP.to], ...SIZE.docs };

/** The world rectangle of a window riding on the deck of a boat at (x, y). */
export const onDeck = (x: number, y: number, scale: number, size: { w: number; h: number }) => {
  const w = 0.62 * 880 * scale;
  const h = (w * size.h) / size.w;
  const cx = x + ((DECK.left + DECK.right) / 2) * scale;
  const bottom = y + DECK.y * scale + 6;
  return { x: cx - w / 2, y: bottom - h, w, h, k: w / size.w };
};

const SpaceScreen = ({ space, frame, text, extra }: {
  space: number;
  frame: number;
  text: Copy;
  extra?: { kind: "docs"; rect: WinRect } | null;
}) => (
  <SpaceView
    space={space}
    frame={frame}
    text={text}
    clock={CLOCK}
    guests={extra ? [{ kind: extra.kind, title: text.windows[extra.kind], rect: extra.rect }] : []}
  />
);

export const P3 = ({ frame: f, text }: SceneProps) => {
  // --- Raycast ---
  const eighth = FRAMES_PER_EIGHTH;
  const typeStart = cueFrame("p3.type");
  const typed = f < typeStart ? 0 : Math.min(5, Math.floor((f - typeStart) / eighth) + 1);
  const query = "ferry".slice(0, typed);
  const panelOpen = cuePop(f, "p3.raycastOpen", 0, 14) * (1 - cueProgress(f, "p3.enter", 1, ease.in, 0.5));
  const selected = f >= cueFrame("p3.arrowDown") ? 1 : 0;

  const keyPress = (cue: string) => {
    const t = (f - cueFrame(cue)) / eighth;
    return t < 0 || t > 1 ? 0 : Math.sin(t * Math.PI);
  };
  const keyShow = (cue: string, until: number) => cuePop(f, cue, -0.3, 14) * (1 - cueProgress(f, cue, 1, ease.in, until));

  const pullOut = cueProgress(f, "p3.pullOut", 1.5, ease.inOut);
  const inHarbor = f >= cueFrame("p3.pullOut");

  const screenBefore = (
    <SpaceScreen space={TRIP.from} frame={f} text={text} extra={{ kind: "docs", rect: DOCS_BEFORE }} />
  );

  if (!inHarbor) {
    return (
      <Shot
        view={FULL}
        overlay={
          <>
            <Caption text={text.p3Caption} show={cueProgress(f, "p3.type", 2, ease.out)} />
            <Keycaps keys={["⌘", "Space"]} appear={keyShow("p3.cmdSpace", 1.5)} press={keyPress("p3.cmdSpace")} y={830} />
            <Keycaps keys={["↓"]} appear={keyShow("p3.arrowDown", 1)} press={keyPress("p3.arrowDown")} y={830} />
            <Keycaps keys={["↵"]} appear={keyShow("p3.enter", 1)} press={keyPress("p3.enter")} y={830} />
          </>
        }
      >
        {screenBefore}
        <RaycastPanel query={query} selected={selected} open={panelOpen} caret={Math.floor(f / 16) % 2 === 0 || typed < 5} />
      </Shot>
    );
  }

  // --- Harbor ---
  const boardStart = cueFrame("p3.board") - eighths(0.5);
  const sailStart = cueFrame("p3.sail");
  const dock = cueFrame("p3.dock");
  const pushIn = cueProgress(f, "p3.pushIn", 2, ease.inOut);

  const depart = dock + eighths(1.2);
  const boatX =
    f < depart
      ? keys(f, [[sailStart, pierX(TRIP.from)], [dock, pierX(TRIP.to)]], ease.inOut)
      : pierX(TRIP.to) + keys(f, [[depart, 0], [depart + eighths(3), 700]], ease.in);
  const velocity =
    f > sailStart && f < dock
      ? Math.sin(((f - sailStart) / (dock - sailStart)) * Math.PI)
      : keys(f, [[depart, 0], [depart + eighths(1.5), 1]], ease.out);
  const b = bob(f, 5, 70);
  const boatY = WATER + 18 + b.y;
  const deck = onDeck(boatX, boatY, BOAT_SCALE, SIZE.docs);

  const from = onCard(TRIP.from, DOCS_BEFORE);
  const to = onCard(TRIP.to, DOCS_AFTER);
  const board = keys(f, [[boardStart, 0], [sailStart, 1]], ease.inOut);
  const unload = keys(f, [[dock, 0], [dock + eighths(1), 1]], ease.inOut);

  let win: { x: number; y: number; w: number; h: number; r: number } | null = null;
  if (f >= boardStart && unload < 1) {
    if (f < sailStart) {
      const arc = Math.sin(board * Math.PI) * 50;
      win = { x: lerp(from.x, deck.x, board), y: lerp(from.y, deck.y, board) - arc, w: lerp(from.w, deck.w, board), h: lerp(from.h, deck.h, board), r: board * 4 };
    } else if (f < dock) {
      win = { ...deck, r: 4 + b.r };
    } else {
      const arc = Math.sin(unload * Math.PI) * 50;
      win = { x: lerp(deck.x, to.x, unload), y: lerp(deck.y, to.y, unload) - arc, w: lerp(deck.w, to.w, unload), h: lerp(deck.h, to.h, unload), r: 4 * (1 - unload) };
    }
  }

  const screen = (space: number) =>
    space === TRIP.from ? (
      <SpaceScreen space={space} frame={f} text={text} extra={f < boardStart ? { kind: "docs", rect: DOCS_BEFORE } : null} />
    ) : space === TRIP.to ? (
      <SpaceScreen space={space} frame={f} text={text} extra={unload >= 1 ? { kind: "docs", rect: DOCS_AFTER } : null} />
    ) : (
      <SpaceScreen space={space} frame={f} text={text} />
    );

  const view = f < cueFrame("p3.pushIn") ? viewportBetween(cardRect(TRIP.from), WIDE, pullOut) : viewportBetween(WIDE, cardRect(TRIP.to), pushIn);

  return (
    <Shot view={view} overlay={<Caption text={text.p3Caption} show={1 - cueProgress(f, "p3.pullOut", 1, ease.out)} />}>
      <Harbor frame={f} screen={screen}>
        <Wake x={boatX - 110} y={WATER - 4} length={220} frame={f} opacity={velocity} />
        <Boat x={boatX} y={boatY} rotate={b.r} scale={BOAT_SCALE} speed={velocity} hideCabin={!!win && f >= sailStart - eighths(0.3) && unload < 0.5} />
        {win && (
          <g transform={`rotate(${win.r} ${win.x + win.w / 2} ${win.y + win.h})`}>
            <g transform={`translate(${win.x} ${win.y}) scale(${win.w / SIZE.docs.w})`}>
              <AppWindow kind="docs" x={0} y={0} {...SIZE.docs} title={text.windows.docs} frame={f} />
            </g>
          </g>
        )}
      </Harbor>
    </Shot>
  );
};
