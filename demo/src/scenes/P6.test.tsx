import { describe, expect, it } from "vitest";
import { copy } from "../copy";
import { menuSpaces, menuTitles, sceneSvg, windowTitles } from "./scene-test";
import { P6, p6Trips } from "./P6";

const INSET = '<svg width="380" height="214" viewBox="0 0 1920 1080">';

describe.each(["en", "zh"] as const)("P6 scene (%s)", (lang) => {
  const text = copy[lang];
  const model = p6Trips(text);
  const terminal = text.windows.terminal;

  it.each([2299, 2330])("draws the terminal once on Space 1 until Landing at frame %i", (frame) => {
    const svg = sceneSvg(P6, frame, text);

    expect(windowTitles(svg).filter((title) => title === terminal)).toHaveLength(1);
    expect(windowTitles(svg)).toContain(text.windows.call);
    expect(menuTitles(svg)).toEqual([terminal]);
    expect(menuSpaces(svg)).toEqual([model.screenSpace(frame)]);
    expect(svg).not.toContain(INSET);
  });

  it("matches the model's Focused windows on both Spaces once the terminal has landed", () => {
    const frame = 2400;
    const svg = sceneSvg(P6, frame, text);
    const insetAt = svg.indexOf(INSET);

    expect(insetAt).toBeGreaterThan(0);
    const main = svg.slice(0, insetAt);
    const inset = svg.slice(insetAt);
    expect(menuTitles(main)).toEqual([model.focusedOn(1, frame)!.title]);
    expect(menuSpaces(main)).toEqual([1]);
    expect(windowTitles(main)).not.toContain(terminal);
    expect(menuTitles(inset)).toEqual([model.focusedOn(4, frame)!.title]);
    expect(menuSpaces(inset)).toEqual([4]);
    expect(windowTitles(inset)).toEqual([terminal]);
    expect(inset).toContain("moved in 3.4 ms, not followed, total 106.9 ms");
  });
});
