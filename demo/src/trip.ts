// The Trip model: where every window of a scene is, and which Space the screen shows, at any
// frame. No drawing: a cast window's `lines` is content the model only carries along for the
// renderers. See GLOSSARY.md (Trip, Arrival, Landing).
import type { ReactNode } from "react";
import { ease, keys, lerp } from "./anim";
import type { WindowKind } from "./components/AppWindow";
import type { Copy } from "./copy";
import { HOME, LANDING, type WinRect } from "./layouts";
import { cueFrame, eighths, positionFrame, trip } from "./timeline";

/** One window of a scene's cast, where it rests before any Trip. */
export type CastWindow = {
  id: string;
  kind: WindowKind;
  title: string;
  lines?: ReactNode;
  /** The Space the window starts on. */
  space: number;
  /** Its resting rectangle on that Space. */
  rect: WinRect;
  /** First frame the window is on its Space; omitted means from the start. */
  appearsAt?: number;
  /** A window from the layout tables that never moves. */
  resident?: boolean;
};

/** A window as drawn on a Space at some frame, at its current resting rectangle. */
export type PlacedWindow = Omit<CastWindow, "space" | "appearsAt">;

/** One Trip of a scene: the tempo-map cue it starts on, the window it carries, and Follow. */
export type TripSpec = { cue: string; window: string; follow: boolean };

type Span = readonly [start: number, end: number];

// A Trip's phases, in eighths after its keystroke or Enter.
const LIFT: Span = [0.5, 1.5];
const TRAVEL: Span = [1.5, 3.5];
const UNLOAD: Span = [3.5, 4.5];
/** Eighths the sea takes to drain once the boat starts to leave. */
const SEA_DRAIN = 0.5;

type ResolvedTrip = {
  cue: string;
  /** Frame of the keystroke or Enter that sends the window. */
  at: number;
  from: number;
  to: number;
  follow: boolean;
  /** The carried window, at its rectangle on the source Space. */
  window: PlacedWindow;
  /** Where the window rests on the Destination Space. */
  landing: WinRect;
  phases: { lift: Span; travel: Span; unload: Span };
  /** Frame the score rings the Destination Space. */
  arrival: number;
  /** First frame the window is on the Destination Space. */
  landingAt: number;
  /**
   * First frame after the Trip is drawn: the boat has left and the sea has settled. For a Follow
   * Trip this is half an eighth past Landing, so its active window includes the boat's departure.
   */
  end: number;
};

/** The Trip being drawn at a frame, with eased 0 → 1 progress through each phase. */
export type ActiveTrip = ResolvedTrip & { progress: { lift: number; travel: number; unload: number } };

export type TripModel = {
  /**
   * The Trip being drawn at `frame`, if any: from its keystroke or Enter until `end`, which for a
   * Follow Trip runs half an eighth past Landing while the boat departs.
   */
  activeTrip: (frame: number) => ActiveTrip | undefined;
  /** The Space the screen shows at `frame`. */
  screenSpace: (frame: number) => number;
  /** The windows on `space` at `frame`, in draw order: the Focused window is last. */
  windowsOn: (space: number, frame: number) => PlacedWindow[];
  /** The Focused window on `space` at `frame`, if the Space has any window. */
  focusedOn: (space: number, frame: number) => PlacedWindow | undefined;
  /**
   * The Focused window at `frame`, the one the menu bar names. While a Trip is drawn it is the
   * carried window, which keeps keyboard focus on the boat although it is on no Space; otherwise
   * it is the Focused window on the Space the screen shows. Keeping the moved window Focused
   * means the menu bar names the window the viewer is watching ride across, not whatever is left
   * behind on the Space (spec #26, user story 29), as the film already did (user story 31).
   */
  focusedWindow: (frame: number) => PlacedWindow | undefined;
};

/** Every Space's resident windows from the layout tables, as cast entries. */
export const residentCast = (text: Copy): CastWindow[] =>
  Object.entries(HOME).flatMap(([space, windows]) =>
    windows.map(({ kind, title, ...rect }) => ({
      id: `${title}@${space}`,
      kind,
      title: text.windows[title],
      space: Number(space),
      rect,
      resident: true,
    })),
  );

const place = ({ space: _space, appearsAt: _appearsAt, ...window }: CastWindow): PlacedWindow => window;

const resolve = (spec: TripSpec, cast: CastWindow[]): ResolvedTrip => {
  const { from, to, arrival } = trip(spec.cue);
  const window = cast.find((w) => w.id === spec.window);
  if (!window) throw new Error(`no cast window ${spec.window} for the Trip on ${spec.cue}`);
  const at = cueFrame(spec.cue);
  const span = ([start, end]: Span): Span => [at + eighths(start), at + eighths(end)];
  const phases = { lift: span(LIFT), travel: span(TRAVEL), unload: span(UNLOAD) };
  // Follow: Landing is the end of unload, and the Trip is drawn SEA_DRAIN longer while the boat
  // departs and the sea drains. No-follow: the window stays on the boat, which has sailed off;
  // Landing is once the sea has settled, SEA_DRAIN into unload, and the Trip ends there.
  const landingAt = spec.follow ? phases.unload[1] : phases.unload[0] + eighths(SEA_DRAIN);
  return {
    cue: spec.cue,
    at,
    from,
    to,
    follow: spec.follow,
    window: place(window),
    landing: { ...LANDING[to], w: window.rect.w, h: window.rect.h },
    phases,
    arrival: positionFrame(...arrival),
    landingAt,
    end: spec.follow ? at + eighths(UNLOAD[1] + SEA_DRAIN) : landingAt,
  };
};

export const tripModel = ({ screen, cast, trips }: { screen: number; cast: CastWindow[]; trips: TripSpec[] }): TripModel => {
  const resolved = trips.map((spec) => resolve(spec, cast)).sort((a, b) => a.at - b.at);

  const activeTrip = (frame: number): ActiveTrip | undefined => {
    const t = resolved.find((r) => frame >= r.at && frame < r.end);
    if (!t) return undefined;
    const along = ([start, end]: Span) => keys(frame, [[start, 0], [end, 1]], ease.inOut);
    return { ...t, progress: { lift: along(t.phases.lift), travel: along(t.phases.travel), unload: t.follow ? along(t.phases.unload) : 0 } };
  };

  const screenSpace = (frame: number) => {
    const active = activeTrip(frame);
    if (active) return active.follow ? Math.round(lerp(active.from, active.to, active.progress.travel)) : active.from;
    return resolved.reduce((space, t) => (t.follow && frame >= t.end ? t.to : space), screen);
  };

  // Ownership: on its source Space until lift, on no Space while on the boat, then on the
  // Destination Space from Landing. `since` orders a Space's windows: the newest comes last.
  const whereIs = (window: CastWindow, frame: number) => {
    if (window.appearsAt !== undefined && frame < window.appearsAt) return undefined;
    let at: { space: number; rect: WinRect; since: number } | undefined = { space: window.space, rect: window.rect, since: window.appearsAt ?? -Infinity };
    for (const t of resolved) {
      if (t.window.id !== window.id || frame < t.phases.lift[0]) continue;
      at = frame < t.landingAt ? undefined : { space: t.to, rect: t.landing, since: t.landingAt };
    }
    return at;
  };

  const windowsOn = (space: number, frame: number): PlacedWindow[] =>
    cast
      .map((window) => ({ window, at: whereIs(window, frame) }))
      .filter(({ at }) => at?.space === space)
      .sort((a, b) => (a.at!.since < b.at!.since ? -1 : a.at!.since > b.at!.since ? 1 : 0))
      .map(({ window, at }) => ({ ...place(window), rect: at!.rect }));

  const focusedOn = (space: number, frame: number) => windowsOn(space, frame).at(-1);

  return {
    activeTrip,
    screenSpace,
    windowsOn,
    focusedOn,
    focusedWindow: (frame) => activeTrip(frame)?.window ?? focusedOn(screenSpace(frame), frame),
  };
};
