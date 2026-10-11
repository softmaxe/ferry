import { describe, expect, it } from "vitest";
import {
  TOTAL_FRAMES,
  cueFrame,
  positionFrame,
  sceneAt,
  scenes,
  timeline,
  trip,
} from "./timeline";

describe("tempo map", () => {
  it("converts bar positions to frames at 60 fps", () => {
    expect(positionFrame(1, 0)).toBe(0);
    expect(positionFrame(2, 0)).toBe(109);
    expect(positionFrame(10, 4)).toBe(1055);
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

  it("resolve by name and reject unknown names", () => {
    expect(cueFrame("p3.enter")).toBe(positionFrame(10, 4));
    expect(() => cueFrame("p9.nope")).toThrow(/unknown cue/);
  });
});

describe("trips", () => {
  it("start on a cue and go between two different Spaces", () => {
    for (const [name, { from, to }] of Object.entries(timeline.trips)) {
      expect(timeline.cues[name], name).toBeDefined();
      for (const space of [from, to]) expect(space, name).toBeOneOf([1, 2, 3, 4, 5]);
      expect(from, name).not.toBe(to);
    }
  });

  it("arrive after they start, within the same scene", () => {
    for (const [name, { arrival }] of Object.entries(timeline.trips)) {
      const scene = sceneAt(cueFrame(name));
      expect(positionFrame(...arrival), name).toBeGreaterThan(cueFrame(name));
      expect(sceneAt(positionFrame(...arrival)), name).toBe(scene);
    }
  });

  it("resolve by cue and reject cues that start no Trip", () => {
    expect(trip("p5.move2")).toEqual({ from: 3, to: 1, arrival: [18, 4] });
    expect(trip("p3.enter")).toEqual({ from: 1, to: 2, arrival: [12, 1] });
    expect(() => trip("p3.type")).toThrow(/no Trip/);
  });
});
