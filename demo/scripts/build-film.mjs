import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia, renderStill } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { compositionIds, demoDir, fileHash, manifestPath, outputFiles, reviewFiles, sourceHash, timeline } from "./film-files.mjs";

process.chdir(demoDir);
mkdirSync("out/review", { recursive: true });
writeFileSync("out/timeline.json", JSON.stringify(timeline, null, 2) + "\n");
execFileSync("uv", ["run", "--directory", "audio", "python", "-m", "ferry_audio",
  "--timeline", path.join(demoDir, "out/timeline.json"),
  "--output", path.join(demoDir, "public/handdrawn.wav")], { stdio: "inherit" });
const inputs = sourceHash();
const serveUrl = await bundle({ entryPoint: path.join(demoDir, "src/index.ts") });
const compositions = await getCompositions(serveUrl);
const findComposition = (id) => {
  const composition = compositions.find((item) => item.id === id);
  if (!composition) throw new Error(`Missing composition: ${id}`);
  return composition;
};

const reviewCues = ["b1.mark", "b2.tagline3", "b3.dock", "b4.move3", "b5.badge3", "b6.link"];
for (const id of compositionIds) {
  const composition = findComposition(id);
  let reported = -1;
  await renderMedia({
    serveUrl, composition, codec: "h264", audioCodec: "aac", audioBitrate: "320k",
    pixelFormat: "yuv420p", crf: 18, imageFormat: "jpeg", jpegQuality: 95, concurrency: 4,
    outputLocation: path.join(demoDir, `out/${id}.mp4`),
    onProgress: ({ progress }) => {
      const percent = Math.floor(progress * 10) * 10;
      if (percent !== reported) { console.log(`${id}: ${percent}%`); reported = percent; }
    },
  });
  for (const [index, beat] of timeline.beats.entries()) {
    const cue = timeline.cues.find((item) => item.id === reviewCues[index]);
    if (!cue) throw new Error(`Missing review cue: ${reviewCues[index]}`);
    const [bar, eighth] = cue.at;
    const frame = Math.round(((bar - 1) * timeline.eighthsPerBar + eighth) * 60 / timeline.dottedQuarterBpm / 3 * timeline.fps) + 36;
    await renderStill({ serveUrl, composition, frame, imageFormat: "png", output: `out/review/${id}-${beat.id}.png` });
  }
}
await renderStill({ serveUrl, composition: findComposition("ferry-paper"), frame: 0, imageFormat: "png", output: "out/review/paper.png" });
// Pair each English frame with its Chinese version in the contact sheet.
const pairs = timeline.beats.flatMap((beat) => compositionIds.map((id) => `out/review/${id}-${beat.id}.png`));
execFileSync("zsh", ["scripts/sheet.sh", "out/review/contact-sheet.png", ...pairs], { stdio: "inherit" });
if (sourceHash() !== inputs) throw new Error("Render inputs changed during the build. Run the build again.");
writeFileSync(manifestPath, JSON.stringify({
  sourceHash: inputs,
  outputs: Object.fromEntries(outputFiles().map((file) => [file, fileHash(path.join(demoDir, file))])),
}, null, 2) + "\n");
execFileSync(process.execPath, ["scripts/check-film.mjs"], { stdio: "inherit" });
console.log(`Rendered both films and ${reviewFiles().length} review frames. Contact sheet: out/review/contact-sheet.png`);
