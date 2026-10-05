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
