import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { captionText } from "./copy";
import { beatById, beatEndFrame, beats, beatStartFrame, positionSeconds, timeline, TOTAL_FRAMES } from "./timeline";

describe("hand-drawn timeline", () => {
  it("covers the film with six consecutive Beats", () => {
    expect(beats).toHaveLength(6);
    expect(beatStartFrame(beats[0])).toBe(0);
    expect(beatEndFrame(beats.at(-1)!)).toBe(TOTAL_FRAMES);
    expect(new Set(beats.map((beat) => beat.id)).size).toBe(beats.length);
    for (const [index, beat] of beats.entries()) {
      expect(beat.bars).toBeGreaterThan(0);
      if (index) expect(beatStartFrame(beat)).toBe(beatEndFrame(beats[index - 1]));
    }
  });

  it("keeps every caption inside its Beat for at least 2.5 seconds without overlaps", () => {
    let previousEnd = 0;
    for (const caption of timeline.captions) {
      const start = positionSeconds(...caption.start);
      const end = positionSeconds(...caption.end);
      const beat = beatById(caption.beat);
      expect(end - start, caption.id).toBeGreaterThanOrEqual(2.5);
      expect(start, caption.id).toBeGreaterThanOrEqual(previousEnd);
      expect(start).toBeGreaterThanOrEqual(positionSeconds(beat.startBar));
      expect(end).toBeLessThanOrEqual(positionSeconds(beat.startBar + beat.bars));
      for (const lang of ["en", "zh"] as const) expect(captionText(lang, caption.id).trim()).not.toBe("");
      previousEnd = end;
    }
  });

  it("keeps cues inside their Beats in narrative order with a synthesis module for each type", () => {
    let previousTime = -1;
    expect(new Set(timeline.cues.map((cue) => cue.id)).size).toBe(timeline.cues.length);
    for (const cue of timeline.cues) {
      const beat = beatById(cue.beat);
      const time = positionSeconds(...cue.at);
      expect(cue.at[1]).toBeGreaterThanOrEqual(0);
      expect(cue.at[1]).toBeLessThan(timeline.eighthsPerBar);
      expect(time, cue.id).toBeGreaterThanOrEqual(previousTime);
      expect(time).toBeGreaterThanOrEqual(positionSeconds(beat.startBar));
      expect(time).toBeLessThan(positionSeconds(beat.startBar + beat.bars));
      expect(existsSync(new URL(`../../audio/ferry_audio/sfx/${cue.type}.py`, import.meta.url)), cue.type).toBe(true);
      previousTime = time;
    }
  });

  it("keeps the same Focused window's trip continuous through the storyboard", () => {
    let space = 1;
    for (const cue of timeline.cues.filter((entry) => entry.move)) {
      expect(cue.move!.from, cue.id).toBe(space);
      expect(cue.move!.to).toBeGreaterThanOrEqual(1);
      expect(cue.move!.to).toBeLessThanOrEqual(5);
      space = cue.move!.to;
    }
  });
});
