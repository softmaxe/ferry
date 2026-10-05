import { describe, expect, it } from "vitest";
import { onDeck } from "./Boat";

describe("onDeck", () => {
  it("places a window centred on the deck, resting on it, scaled with the boat", () => {
    // Worked example: the deck's centre is x = -47.5 and its top y = -215 in boat units; the
    // carried window is 62% of the 880-unit cabin span wide and keeps its aspect ratio.
    const rect = onDeck(960, 1000, 0.5, { w: 880, h: 550 });

    expect(rect.x).toBeCloseTo(799.85);
    expect(rect.y).toBeCloseTo(728);
    expect(rect.w).toBeCloseTo(272.8);
    expect(rect.h).toBeCloseTo(170.5);
  });
});
