import { describe, expect, it } from "vitest";
import { copy } from "../copy";
import { menuSpaces, menuTitles, sceneSvg, windowTitles } from "./scene-test";
import { P5 } from "./P5";

const MOVES = [
  {
    window: "design", from: 2, to: 3,
    before: [1745, 1753], after: [1827, 1835],
    transit: [[1754, 2], [1790, 2], [1791, 3], [1826, 3]],
  },
  {
    window: "dm", from: 3, to: 1,
    before: [1855, 1863], after: [1937, 1945],
    transit: [[1864, 3], [1900, 2], [1919, 1], [1936, 1]],
  },
  {
    window: "music", from: 1, to: 5,
    before: [1964, 1972], after: [2046, 2054],
    transit: [[1973, 1], [2003, 2], [2010, 3], [2016, 4], [2045, 5]],
  },
] as const;

describe.each(["en", "zh"] as const)("P5 scene (%s)", (lang) => {
  const text = copy[lang];

  describe.each(MOVES)("$window move", ({ window, from, to, before, transit, after }) => {
    const title = text.windows[window];

    it.each(before)("draws the focused window once before lift at frame %i", (frame) => {
      const svg = sceneSvg(P5, frame, text);

      expect(windowTitles(svg).filter((value) => value === title)).toHaveLength(1);
      expect(menuTitles(svg)).toEqual([title]);
      expect(menuSpaces(svg)).toEqual([from]);
    });

    it.each(transit.map(([frame, space]) => ({ frame, space })))("draws the focused window once in transit at frame $frame on Space $space", ({ frame, space }) => {
      const svg = sceneSvg(P5, frame, text);

      expect(windowTitles(svg).filter((value) => value === title)).toHaveLength(1);
      expect(menuTitles(svg)).toEqual([title]);
      expect(menuSpaces(svg)).toEqual([space]);
    });

    it.each(after)("draws the focused window once after unloading at frame %i", (frame) => {
      const svg = sceneSvg(P5, frame, text);

      expect(windowTitles(svg).filter((value) => value === title)).toHaveLength(1);
      expect(menuTitles(svg)).toEqual([title]);
      expect(menuSpaces(svg)).toEqual([to]);
    });
  });

  it.each([
    { frame: 1836, space: 3, focused: "dm", windows: ["moodboard", "design", "dm"] },
    { frame: 1854, space: 3, focused: "dm", windows: ["moodboard", "design", "dm"] },
    { frame: 1946, space: 1, focused: "music", windows: ["chat", "dm", "music"] },
    { frame: 1963, space: 1, focused: "music", windows: ["chat", "dm", "music"] },
    { frame: 2055, space: 5, focused: "music", windows: ["music"] },
    { frame: 2073, space: 5, focused: "music", windows: ["music"] },
  ] as const)("preserves the settled handoff at frame $frame", ({ frame, space, focused, windows }) => {
    const svg = sceneSvg(P5, frame, text);

    expect(windowTitles(svg)).toEqual(windows.map((window) => text.windows[window]));
    expect(menuTitles(svg)).toEqual([text.windows[focused]]);
    expect(menuSpaces(svg)).toEqual([space]);
  });

  it.each([
    { frame: 1835, window: "dm" },
    { frame: 1945, window: "music" },
  ] as const)("keeps $window absent until its existing appearance cue", ({ frame, window }) => {
    expect(windowTitles(sceneSvg(P5, frame, text))).not.toContain(text.windows[window]);
  });

  it.each([
    { frame: 1745, space: 2, focused: "design", windows: ["code", "docs", "design"] },
    { frame: 1855, space: 3, focused: "dm", windows: ["moodboard", "design", "dm"] },
    { frame: 1900, space: 2, focused: "dm", windows: ["moodboard", "design", "code", "docs", "dm"] },
    { frame: 1964, space: 1, focused: "music", windows: ["chat", "dm", "music"] },
    { frame: 2003, space: 2, focused: "music", windows: ["chat", "dm", "code", "docs", "music"] },
    { frame: 2006, space: 2, focused: "music", windows: ["code", "docs", "moodboard", "design", "music"] },
    { frame: 2010, space: 3, focused: "music", windows: ["moodboard", "design", "music"] },
  ] as const)("preserves other windows and earlier arrivals at frame $frame", ({ frame, space, focused, windows }) => {
    const svg = sceneSvg(P5, frame, text);

    expect(windowTitles(svg)).toEqual(windows.map((window) => text.windows[window]));
    expect(menuTitles(svg)).toEqual([text.windows[focused]]);
    expect(menuSpaces(svg)).toEqual([space]);
  });
});
