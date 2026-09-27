import { describe, expect, it } from "vitest";
import { copy } from "../copy";
import { cueFrame, eighths, positionFrame } from "../timeline";
import { B4 } from "./B4";
import { menuSpaces, menuTitles, sceneSvg, windowTitles } from "./scene-test";

const trips = [
  { index: 1, from: 2, to: 3, samples: [[0.1, 2], [0.4, 2], [0.6, 3], [0.9, 3]] },
  { index: 2, from: 3, to: 1, samples: [[0.1, 3], [0.5, 2], [0.9, 1]] },
  { index: 3, from: 1, to: 5, samples: [[0.1, 1], [0.25, 2], [0.5, 3], [0.75, 4], [0.9, 5]] },
] as const;

describe.each(["en", "zh"] as const)("B4 Follow montage (%s)", (lang) => {
  const text = copy[lang];
  const checkFocus = (frame: number, space: number) => {
    const svg = sceneSvg(B4, frame, lang, "B4");
    expect(windowTitles(svg).filter((title) => title === text.windows.docs)).toHaveLength(1);
    expect(menuTitles(svg)).toEqual([text.windows.docs]);
    expect(menuSpaces(svg)).toEqual([space]);
    return svg;
  };

  describe.each(trips)("move $index from $from to $to", ({ index, from, to, samples }) => {
    const board = cueFrame(`b4.move${index}`);
    const arrival = cueFrame(`b4.arrival${index}`);
    const sail = board + eighths(1);
    const dock = arrival - eighths(1);

    it.each([board - 1, board, sail - 1])("draws the Focused window once before sailing at frame %i", (frame) => {
      checkFocus(frame, from);
    });

    it.each(samples.map(([fraction, space]) => ({ frame: Math.round(sail + (dock - sail) * fraction), space })))
      ("follows the visible Space $space during transit at frame $frame", ({ frame, space }) => {
        checkFocus(frame, space);
      });

    it.each([dock, arrival - 1, arrival, arrival + 1])("draws the Focused window once through unloading at frame %i", (frame) => {
      checkFocus(frame, to);
    });
  });

  it.each([
    { frame: cueFrame("b4.note5") + eighths(1), space: 2 },
    { frame: cueFrame("b4.arrival1") + eighths(1), space: 3 },
    { frame: cueFrame("b4.move2") - 1, space: 3 },
    { frame: cueFrame("b4.arrival2") + eighths(1), space: 1 },
    { frame: cueFrame("b4.move3") - 1, space: 1 },
    { frame: cueFrame("b4.arrival3") + eighths(1), space: 5 },
    { frame: positionFrame(27) - 1, space: 5 },
  ])("preserves the settled handoff on Space $space at frame $frame", ({ frame, space }) => {
    checkFocus(frame, space);
  });

  it("preserves every resident in the five-Pier overview", () => {
    const svg = checkFocus(cueFrame("b4.note5") + eighths(1), 2);
    expect(windowTitles(svg)).toEqual([text.windows.chat, text.windows.code, text.windows.design, text.windows.terminal, text.windows.call, text.windows.docs]);
  });

  it.each([
    { frame: cueFrame("b4.move1"), resident: "code" },
    { frame: cueFrame("b4.move2"), resident: "design" },
    { frame: Math.round((cueFrame("b4.move2") + cueFrame("b4.arrival2")) / 2), resident: "code" },
    { frame: cueFrame("b4.move3"), resident: "chat" },
    { frame: cueFrame("b4.arrival3") + eighths(1), resident: "call" },
  ] as const)("keeps the $resident resident when its Pier is visible at frame $frame", ({ frame, resident }) => {
    const titles = windowTitles(sceneSvg(B4, frame, lang, "B4"));
    expect(titles.filter((title) => title === text.windows[resident])).toHaveLength(1);
    expect(titles.filter((title) => title === text.windows.docs)).toHaveLength(1);
  });
});
