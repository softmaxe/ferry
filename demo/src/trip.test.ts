import { describe, expect, it } from "vitest";
import { copy } from "./copy";
import { residentCast, tripModel } from "./trip";

// The P6 no-follow scene: a call and a terminal on Space 1; Enter (frame 2291) sends the terminal
// to Space 4 while the screen stays on the call.
const text = copy.en;
const P6 = tripModel({
  screen: 1,
  cast: [
    ...residentCast(text),
    { id: "call", kind: "call", title: "Call", space: 1, rect: { x: 90, y: 90, w: 1040, h: 720 } },
    { id: "terminal", kind: "terminal", title: "Terminal", space: 1, rect: { x: 830, y: 430, w: 1000, h: 560 } },
  ],
  trips: [{ cue: "p6.enter", window: "terminal", follow: false }],
});

const SPACES = [1, 2, 3, 4, 5];
const P6_FRAMES = Array.from({ length: 2436 - 2280 }, (_, i) => 2280 + i);
const ids = (space: number, frame: number) => P6.windowsOn(space, frame).map((w) => w.id);

describe("P6 no-follow Trip", () => {
  it("keeps the screen on the source Space throughout", () => {
    for (const frame of P6_FRAMES) expect(P6.screenSpace(frame), `frame ${frame}`).toBe(1);
  });

  it.each([2280, 2291, 2299])("has the terminal on the source Space before lift at frame %i", (frame) => {
    expect(ids(1, frame)).toEqual(["chat@1", "call", "terminal"]);
    expect(ids(4, frame)).toEqual([]);
  });

  it.each([2300, 2330, 2363])("has the terminal on no Space in transit at frame %i", (frame) => {
    for (const space of SPACES) expect(ids(space, frame)).not.toContain("terminal");
  });

  it.each([2364, 2400, 2435])("rests the terminal on the Destination Space from Landing at frame %i", (frame) => {
    expect(ids(1, frame)).toEqual(["chat@1", "call"]);
    expect(P6.windowsOn(4, frame)).toEqual([
      { id: "terminal", kind: "terminal", title: "Terminal", rect: { x: 460, y: 240, w: 1000, h: 560 } },
    ]);
  });

  it("returns focus on the source Space to the call after lift", () => {
    expect(P6.focusedOn(1, 2299)?.id).toBe("terminal");
    expect(P6.focusedOn(1, 2300)?.id).toBe("call");
    expect(P6.focusedOn(1, 2400)?.id).toBe("call");
    expect(P6.focusedOn(4, 2363)).toBeUndefined();
    expect(P6.focusedOn(4, 2364)?.id).toBe("terminal");
  });

  it.each([
    { frame: 2299, window: "terminal" },
    { frame: 2300, window: "terminal" },
    { frame: 2363, window: "terminal" },
    { frame: 2364, window: "call" },
  ])("has $window as the Focused window at frame $frame", ({ frame, window }) => {
    expect(P6.focusedWindow(frame)?.id).toBe(window);
  });

  it("is the active Trip from Enter until Landing", () => {
    expect(P6.activeTrip(2290)).toBeUndefined();
    expect(P6.activeTrip(2291)).toMatchObject({ cue: "p6.enter", from: 1, to: 4, follow: false, window: { id: "terminal" } });
    expect(P6.activeTrip(2363)?.cue).toBe("p6.enter");
    expect(P6.activeTrip(2364)).toBeUndefined();
  });

  it("reports lift and travel progress, with no unload shown", () => {
    expect(P6.activeTrip(2291)?.progress).toEqual({ lift: 0, travel: 0, unload: 0 });
    expect(P6.activeTrip(2318)?.progress).toEqual({ lift: 1, travel: 0, unload: 0 });
    expect(P6.activeTrip(2355)?.progress).toEqual({ lift: 1, travel: 1, unload: 0 });
  });

  it("never has a window on two Spaces at once", () => {
    for (const frame of P6_FRAMES) {
      const all = SPACES.flatMap((space) => ids(space, frame));
      expect(new Set(all).size, `frame ${frame}`).toBe(all.length);
    }
  });
});

// The P5 hotkey montage: three Follow Trips 2 → 3 → 1 → 5 on cues at frames 1745, 1855 and 1964.
// Docs stays on Space 2; the DM and music windows pop onto their source Space only after the
// previous Trip.
const P5 = tripModel({
  screen: 2,
  cast: [
    ...residentCast(text),
    { id: "docs", kind: "docs", title: "Docs", space: 2, rect: { x: 870, y: 200, w: 1000, h: 700 } },
    { id: "design", kind: "design", title: "Design", space: 2, rect: { x: 780, y: 230, w: 1000, h: 680 } },
    { id: "dm", kind: "chat", title: "DM", space: 3, rect: { x: 300, y: 330, w: 900, h: 620 }, appearsAt: 1836 },
    { id: "music", kind: "music", title: "Music", space: 1, rect: { x: 260, y: 420, w: 820, h: 520 }, appearsAt: 1946 },
  ],
  trips: [
    { cue: "p5.move1", window: "design", follow: true },
    { cue: "p5.move2", window: "dm", follow: true },
    { cue: "p5.move3", window: "music", follow: true },
  ],
});

const P5_FRAMES = Array.from({ length: 2280 - 1745 }, (_, i) => 1745 + i);
const p5Ids = (space: number, frame: number) => P5.windowsOn(space, frame).map((w) => w.id);

describe.each([
  {
    cue: "p5.move1", window: "design", from: 2, to: 3, at: 1745, lift: 1754, landingAt: 1827, end: 1836,
    source: { before: ["code@2", "docs", "design"], after: ["code@2", "docs"] },
    destination: { before: ["moodboard@3"], after: ["moodboard@3", "design"] },
    landing: { x: 800, y: 260, w: 1000, h: 680 },
    screen: [[1745, 2], [1790, 2], [1791, 3], [1826, 3], [1836, 3]],
  },
  {
    cue: "p5.move2", window: "dm", from: 3, to: 1, at: 1855, lift: 1864, landingAt: 1937, end: 1946,
    source: { before: ["moodboard@3", "design", "dm"], after: ["moodboard@3", "design"] },
    destination: { before: ["chat@1"], after: ["chat@1", "dm"] },
    landing: { x: 760, y: 170, w: 900, h: 620 },
    screen: [[1855, 3], [1864, 3], [1900, 2], [1919, 1], [1936, 1], [1946, 1]],
  },
  {
    cue: "p5.move3", window: "music", from: 1, to: 5, at: 1964, lift: 1973, landingAt: 2046, end: 2055,
    source: { before: ["chat@1", "dm", "music"], after: ["chat@1", "dm"] },
    destination: { before: [], after: ["music"] },
    landing: { x: 550, y: 250, w: 820, h: 520 },
    screen: [[1964, 1], [1973, 1], [2003, 2], [2010, 3], [2016, 4], [2045, 5], [2055, 5]],
  },
] as const)("P5 Follow Trip on $cue", ({ cue, window, from, to, at, lift, landingAt, end, source, destination, landing, screen }) => {
  it("has the window focused on the source Space before lift", () => {
    for (const frame of [at, lift - 1]) {
      expect(p5Ids(from, frame), `frame ${frame}`).toEqual(source.before);
      expect(P5.focusedOn(from, frame)?.id).toBe(window);
      expect(p5Ids(to, frame)).toEqual(destination.before);
    }
  });

  it("has the window on no Space from lift until just before Landing", () => {
    for (const frame of [lift, landingAt - 1]) {
      for (const space of SPACES) expect(p5Ids(space, frame), `frame ${frame}`).not.toContain(window);
      expect(p5Ids(from, frame)).toEqual(source.after);
    }
  });

  it("rests the window focused on the Destination Space at Landing", () => {
    expect(p5Ids(to, landingAt)).toEqual(destination.after);
    expect(P5.focusedOn(to, landingAt)).toMatchObject({ id: window, rect: landing });
  });

  it.each(screen.map(([frame, space]) => ({ frame, space })))("shows Space $space at frame $frame", ({ frame, space }) => {
    expect(P5.screenSpace(frame)).toBe(space);
  });

  it("is the active Trip from its cue until the sea drains", () => {
    expect(P5.activeTrip(at - 1)?.cue).not.toBe(cue);
    expect(P5.activeTrip(at)).toMatchObject({ cue, from, to, follow: true, window: { id: window }, landingAt });
    expect(P5.activeTrip(end - 1)?.cue).toBe(cue);
    expect(P5.activeTrip(end)).toBeUndefined();
  });

  it("keeps the window as the Focused window for the whole Trip", () => {
    for (const frame of [at, lift, landingAt - 1, end - 1]) expect(P5.focusedWindow(frame)?.id, `frame ${frame}`).toBe(window);
  });

  it("rings its Arrival within the unload phase", () => {
    const { arrival, phases } = P5.activeTrip(at)!;
    expect(arrival).toBeGreaterThanOrEqual(phases.unload[0]);
    expect(arrival).toBeLessThanOrEqual(phases.unload[1]);
  });
});

describe("P5 hotkey montage", () => {
  it.each([
    { window: "dm", space: 3, appearsAt: 1836 },
    { window: "music", space: 1, appearsAt: 1946 },
  ])("pops $window onto Space $space at frame $appearsAt", ({ window, space, appearsAt }) => {
    for (const s of SPACES) expect(p5Ids(s, appearsAt - 1)).not.toContain(window);
    expect(P5.focusedOn(space, appearsAt)?.id).toBe(window);
  });

  it("keeps docs on Space 2 throughout", () => {
    for (const frame of P5_FRAMES) expect(p5Ids(2, frame), `frame ${frame}`).toContain("docs");
  });

  it("never has a window on two Spaces at once", () => {
    for (const frame of P5_FRAMES) {
      const all = SPACES.flatMap((space) => p5Ids(space, frame));
      expect(new Set(all).size, `frame ${frame}`).toBe(all.length);
    }
  });
});
