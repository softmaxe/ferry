import { describe, expect, it } from "vitest";
import { copy } from "../copy";
import { menuSpaces, menuTitles, sceneSvg, windowTitles } from "./scene-test";
import { P5, p5Trips } from "./P5";

// Ownership and focus frame by frame live in trip.test.ts; these frames check that the scene
// draws what the Trip model says, in both languages.
describe.each(["en", "zh"] as const)("P5 scene (%s)", (lang) => {
  const text = copy[lang];
  const model = p5Trips(text);

  it.each([
    { frame: 1745, window: "design" },
    { frame: 1855, window: "dm" },
  ] as const)("draws the focused $window once and names it in the menu before lift at frame $frame", ({ frame, window }) => {
    const svg = sceneSvg(P5, frame, text);
    const space = model.screenSpace(frame);

    expect(windowTitles(svg).filter((title) => title === text.windows[window])).toHaveLength(1);
    expect(menuTitles(svg)).toEqual([model.focusedOn(space, frame)!.title]);
    expect(menuSpaces(svg)).toEqual([space]);
  });

  it("draws the moved window once on the boat while the Spaces slide past", () => {
    const frame = 2010;
    const svg = sceneSvg(P5, frame, text);

    expect(windowTitles(svg).filter((title) => title === text.windows.music)).toHaveLength(1);
    expect(menuTitles(svg)).toEqual([model.activeTrip(frame)!.window.title]);
    expect(menuSpaces(svg)).toEqual([model.screenSpace(frame)]);
  });

  it("draws the settled Space as the model lists it after Landing", () => {
    const frame = 1946;
    const svg = sceneSvg(P5, frame, text);
    const space = model.screenSpace(frame);

    expect(windowTitles(svg)).toEqual(model.windowsOn(space, frame).map((w) => w.title));
    expect(menuTitles(svg)).toEqual([model.focusedOn(space, frame)!.title]);
    expect(menuSpaces(svg)).toEqual([space]);
  });
});
