// Targets are absolute frames, cue+offset, or a Beat ID (its midpoint).
// Usage: npm run stills -- ferry-en B1 B6 b3.dock+30 1234
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { positionFrame, timeline } from "./film-files.mjs";

const [id = "ferry-en", ...requested] = process.argv.slice(2);
const targets = requested.length ? requested : timeline.beats.map((beat) => beat.id);
const toFrame = (target) => {
  const [name, offset = "0"] = target.split("+");
  if (!/^\d+$/.test(offset)) throw new Error(`Invalid frame offset: ${target}`);
  let frame;
  if (/^\d+$/.test(name)) frame = Number(name);
  else {
    const beat = timeline.beats.find((item) => item.id === name);
    const cue = timeline.cues.find((item) => item.id === name)?.at;
    if (beat) frame = positionFrame(beat.startBar + beat.bars / 2);
    else if (cue) frame = positionFrame(...cue);
    else throw new Error(`Unknown Beat, cue or frame: ${target}`);
  }
  return frame + Number(offset);
};
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id });
mkdirSync("out/stills", { recursive: true });
for (const target of targets) {
  const frame = toFrame(target);
  if (frame < 0 || frame >= composition.durationInFrames) throw new Error(`Frame outside ${id}: ${frame}`);
  const output = `out/stills/${id}-${target.replace(/[^\w.+-]/g, "_")}.png`;
  await renderStill({ serveUrl, composition, frame, output, imageFormat: "png" });
  console.log(output);
}
