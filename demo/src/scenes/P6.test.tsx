import { describe, expect, it } from "vitest";
import { copy } from "../copy";
import { menuSpaces, menuTitles, sceneSvg, windowTitles } from "./scene-test";
import { P6 } from "./P6";

const INSET = '<svg width="380" height="214" viewBox="0 0 1920 1080">';

describe.each(["en", "zh"] as const)("P6 scene (%s)", (lang) => {
  const text = copy[lang];

  it.each([2290, 2291, 2299])("keeps the terminal focused before lift at frame %i", (frame) => {
    const svg = sceneSvg(P6, frame, text);

    expect(windowTitles(svg).filter((title) => title === text.windows.terminal)).toHaveLength(1);
    expect(windowTitles(svg)).toContain(text.windows.call);
    expect(menuTitles(svg)).toEqual([text.windows.terminal]);
    expect(menuSpaces(svg)).toEqual([1]);
  });

  it.each([2300, 2318, 2337, 2363])("keeps the transit title and original Space at frame %i", (frame) => {
    const svg = sceneSvg(P6, frame, text);

    expect(menuTitles(svg)).toEqual([text.windows.terminal]);
    expect(menuSpaces(svg)).toEqual([1]);
    expect(windowTitles(svg)).toContain(text.windows.call);
    expect(svg).not.toContain(INSET);
  });

  it("returns focus to the call at frame 2364 before the inset appears", () => {
    const svg = sceneSvg(P6, 2364, text);

    expect(menuTitles(svg)).toEqual([text.windows.call]);
    expect(menuSpaces(svg)).toEqual([1]);
    expect(windowTitles(svg)).toContain(text.windows.call);
    expect(windowTitles(svg)).not.toContain(text.windows.terminal);
    expect(svg).not.toContain(INSET);
  });

  it.each([2365, 2399, 2400, 2435])("keeps the destination inset separate at frame %i", (frame) => {
    const svg = sceneSvg(P6, frame, text);
    const insetAt = svg.indexOf(INSET);

    expect(insetAt).toBeGreaterThan(0);
    const main = svg.slice(0, insetAt);
    const inset = svg.slice(insetAt);
    expect(menuTitles(main)).toEqual([text.windows.call]);
    expect(menuSpaces(main)).toEqual([1]);
    expect(windowTitles(main)).toContain(text.windows.call);
    expect(windowTitles(main)).not.toContain(text.windows.terminal);
    expect(menuTitles(inset)).toEqual([text.windows.terminal]);
    expect(menuSpaces(inset)).toEqual([4]);
    expect(windowTitles(inset)).toEqual([text.windows.terminal]);
    expect(inset).toContain("ferry --no-follow --verbose 4");
    expect(inset).toContain("window 12877 (via accessibility) -&gt; space 4 (id 1):");
    expect(inset).toContain("moved in 3.4 ms, not followed, total 106.9 ms");
  });

  it("removes the inset after the existing reveal at frame 2436", () => {
    const svg = sceneSvg(P6, 2436, text);

    expect(svg).not.toContain(INSET);
    expect(menuTitles(svg)).toEqual([text.windows.call]);
    expect(menuSpaces(svg)).toEqual([1]);
  });
});
