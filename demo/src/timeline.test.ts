import { describe, expect, it } from "vitest";
import {
  FPS,
  SECONDS_PER_BAR,
  SECONDS_PER_EIGHTH,
  TOTAL_FRAMES,
  cueFrame,
  cueSeconds,
  positionFrame,
  sceneAt,
  scenes,
  timeline,
} from "./timeline";

describe("tempo map", () => {
  it("uses 6/8 at dotted quarter = 66", () => {
    expect(SECONDS_PER_EIGHTH).toBeCloseTo(60 / 66 / 3, 10);
    expect(SECONDS_PER_BAR).toBeCloseTo((60 / 66) * 2, 10);
  });

  it("converts bar positions to frames at 60 fps", () => {
    expect(FPS).toBe(60);
    expect(positionFrame(1, 0)).toBe(0);
    expect(positionFrame(2, 0)).toBe(Math.round(SECONDS_PER_BAR * 60));
    expect(positionFrame(10, 4)).toBe(Math.round((9 * 6 + 4) * SECONDS_PER_EIGHTH * 60));
  });

  it("covers all bars plus the tail", () => {
    const seconds = timeline.bars * SECONDS_PER_BAR + timeline.tailSeconds;
    expect(TOTAL_FRAMES).toBe(Math.ceil(seconds * FPS));
    expect(seconds).toBeGreaterThan(45);
    expect(seconds).toBeLessThan(55);
  });
});

describe("scenes", () => {
  it("are contiguous four-bar phrases that cover every bar", () => {
    let next = 1;
    for (const scene of scenes) {
      expect(scene.startBar).toBe(next);
      expect(scene.bars).toBe(4);
      next += scene.bars;
    }
    expect(next).toBe(timeline.bars + 1);
  });

  it("finds the scene playing at a frame", () => {
    expect(sceneAt(0).id).toBe("P1");
    expect(sceneAt(positionFrame(9, 0)).id).toBe("P3");
    expect(sceneAt(TOTAL_FRAMES - 1).id).toBe("P7");
  });
});

describe("cues", () => {
  const entries = Object.entries(timeline.cues);

  it("sit inside the scene their name belongs to", () => {
    for (const [name, [bar, eighth]] of entries) {
      const scene = scenes.find((s) => name.startsWith(`${s.id.toLowerCase()}.`));
      expect(scene, name).toBeDefined();
      expect(bar, name).toBeGreaterThanOrEqual(scene!.startBar);
      expect(bar, name).toBeLessThan(scene!.startBar + scene!.bars);
      expect(eighth, name).toBeGreaterThanOrEqual(0);
      expect(eighth, name).toBeLessThan(6);
    }
  });

  it("are listed in playing order", () => {
    const times = entries.map(([name]) => cueSeconds(name));
    expect(times).toEqual([...times].sort((a, b) => a - b));
  });

  it("resolve by name and reject unknown names", () => {
    expect(cueFrame("p3.enter")).toBe(positionFrame(10, 4));
    expect(() => cueFrame("p9.nope")).toThrow(/unknown cue/);
  });
});
