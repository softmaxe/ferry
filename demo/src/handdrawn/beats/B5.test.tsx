import { describe, expect, it } from "vitest";
import { copy } from "../copy";
import { cueFrame, eighths } from "../timeline";
import { B5 } from "./B5";
import { menuSpaces, menuTitles, sceneSvg, windowTitles } from "./scene-test";

const INSET = '<g data-destination-inset="true"';
const enter = cueFrame("b5.enter");
const sail = cueFrame("b5.sail");
const inset = cueFrame("b5.inset");
const sourceExit = inset + eighths(3);

describe.each(["en", "zh"] as const)("B5 no-follow scene (%s)", (lang) => {
  const text = copy[lang];

  it.each([enter - eighths(1), enter - 1, enter, sail - 1, sail, inset - 1])("keeps one terminal and the source menu while departing at frame %i", (frame) => {
    const svg = sceneSvg(B5, frame, lang, "B5");
    expect(windowTitles(svg).filter((title) => title === text.windows.terminal)).toHaveLength(1);
    expect(windowTitles(svg).filter((title) => title === text.windows.call)).toHaveLength(1);
    expect(menuTitles(svg)).toEqual([text.windows.terminal]);
    expect(menuSpaces(svg)).toEqual([5]);
    expect(svg).not.toContain(INSET);
  });

  it.each([inset, inset + eighths(1), sourceExit - 1])("opens a destination view without duplicating the terminal at frame %i", (frame) => {
    const svg = sceneSvg(B5, frame, lang, "B5");
    const boundary = svg.indexOf(INSET);
    expect(boundary).toBeGreaterThan(0);
    expect(windowTitles(svg.slice(0, boundary)).filter((title) => title === text.windows.terminal)).toHaveLength(1);
    expect(windowTitles(svg.slice(boundary))).not.toContain(text.windows.terminal);
    expect(menuTitles(svg)).toEqual([text.windows.terminal]);
    expect(menuSpaces(svg)).toEqual([5]);
  });

  it.each([sourceExit, cueFrame("b5.dock"), cueFrame("b5.arrival") + eighths(1), cueFrame("b5.verbose") + eighths(2), cueFrame("b5.badge3") + eighths(1)])("keeps the call on Space 5 and the terminal only in the Space 4 inset at frame %i", (frame) => {
    const svg = sceneSvg(B5, frame, lang, "B5");
    const boundary = svg.indexOf(INSET);
    const main = svg.slice(0, boundary);
    const destination = svg.slice(boundary);
    expect(windowTitles(main)).toEqual([text.windows.call]);
    expect(menuTitles(main)).toEqual([text.windows.call]);
    expect(menuSpaces(main)).toEqual([5]);
    expect(windowTitles(destination)).toEqual([text.windows.terminal]);
    expect(menuTitles(destination)).toEqual([text.windows.terminal]);
    expect(menuSpaces(destination)).toEqual([4]);
    expect(windowTitles(svg).filter((title) => title === text.windows.terminal)).toHaveLength(1);
    expect(destination.replace(/<[^>]+>/g, "")).toContain("ferry --no-follow --verbose 4");
  });

  it("shows the recorded English output and localized guarantees without moving the main screen", () => {
    const svg = sceneSvg(B5, cueFrame("b5.badge3") + eighths(1), lang, "B5");
    expect(svg).toContain("window 12877 (via accessibility) -&gt; space 4 (id 1):");
    expect(svg).toContain("moved in 3.4 ms, not followed, total 106.9 ms");
    for (const badge of text.badges) expect(svg).toContain(badge);
    expect(menuSpaces(svg)[0]).toBe(5);
  });
});
