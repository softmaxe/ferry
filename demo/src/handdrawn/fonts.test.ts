import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CAPTION_FONT_SIZE, CAPTION_WIDTH } from "./Caption";
import { allStrings, captionText, copy } from "./copy";
import { timeline } from "./timeline";

const metrics = JSON.parse(execFileSync("uv", ["run", "--directory", "audio", "python", "../scripts/font-info.py"], { encoding: "utf8" })) as {
  unitsPerEm: number; advances: Record<string, number>;
};
const charset = readFileSync(new URL("../../public/fonts/LXGWWenKai-Regular.subset.charset.txt", import.meta.url), "utf8").trimEnd();

describe("bundled WenKai", () => {
  it("matches its charset manifest to the actual font", () => {
    expect([...charset].map((character) => character.codePointAt(0)!).sort((a, b) => a - b))
      .toEqual(Object.keys(metrics.advances).map(Number).sort((a, b) => a - b));
  });
  it("draws every glyph in both languages, including all captions", () => {
    const text = allStrings(copy).join("") + timeline.beats.map((beat) => beat.name).join("");
    for (const glyph of new Set([...text])) {
      expect(metrics.advances[String(glyph.codePointAt(0))], glyph).toBeDefined();
    }
  });
  it("fits each caption on one line at the rendered font size", () => {
    for (const lang of ["en", "zh"] as const) {
      for (const caption of timeline.captions) {
        const text = captionText(lang, caption.id);
        const width = [...text].reduce((sum, glyph) => sum + metrics.advances[String(glyph.codePointAt(0))], 0) / metrics.unitsPerEm * CAPTION_FONT_SIZE;
        expect(width, `${lang}/${caption.id}: ${text}`).toBeLessThanOrEqual(CAPTION_WIDTH);
      }
    }
  });
});
