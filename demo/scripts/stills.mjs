// Renders chosen frames to PNG with one bundle: node scripts/stills.mjs <composition> <frame|p3.enter> ...
// A cue name renders the frame where that cue lands; "cue+N" adds N frames.
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

const [id = "ferry-en", ...targets] = process.argv.slice(2);
const timeline = JSON.parse(readFileSync(new URL("../src/timeline.json", import.meta.url)));
const eighth = 60 / timeline.dottedQuarterBpm / 3;

const toFrame = (target) => {
  const [name, plus = "0"] = target.split("+");
  if (/^\d+$/.test(name)) return Number(name) + Number(plus);
  const cue = timeline.cues[name];
  if (!cue) throw new Error(`unknown cue ${name}`);
  const [bar, e] = cue;
  return Math.round(((bar - 1) * timeline.eighthsPerBar + e) * eighth * timeline.fps) + Number(plus);
};

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id });
mkdirSync("out/stills", { recursive: true });
for (const target of targets) {
  const frame = toFrame(target);
  const output = `out/stills/${id}-${target.replace(/[^\w.+-]/g, "_")}.png`;
  await renderStill({ serveUrl, composition, frame, output, imageFormat: "png" });
  console.log(output);
}
