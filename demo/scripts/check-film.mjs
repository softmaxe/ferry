import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { compositionIds, demoDir, duration, fileHash, manifestPath, outputFiles, sourceHash, timeline, totalFrames } from "./film-files.mjs";

process.chdir(demoDir);
assert(existsSync(manifestPath), "Missing build manifest. Run the complete film build first.");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
assert.equal(manifest.sourceHash, sourceHash(), "Film inputs have changed. Rebuild both films before checking them.");
for (const file of outputFiles()) {
  assert(existsSync(file), `Missing film output: ${file}`);
  assert.equal(fileHash(path.join(demoDir, file)), manifest.outputs[file], `Film output changed since the build: ${file}`);
}

const rawFrame = (args, filter = "scale=192:108") => execFileSync("ffmpeg", ["-v", "error", ...args, "-frames:v", "1", "-vf", filter, "-f", "rawvideo", "-pix_fmt", "rgb24", "pipe:1"]);
const paper = rawFrame(["-i", "out/review/paper.png"]);
for (const id of compositionIds) {
  const file = `out/${id}.mp4`;
  const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", file], { encoding: "utf8" }));
  assert.equal(probe.streams.length, 2, `${id}: expected exactly one video and one audio stream`);
  const video = probe.streams.find((stream) => stream.codec_type === "video");
  const audio = probe.streams.find((stream) => stream.codec_type === "audio");
  assert(video && audio, `${id}: missing video or audio`);
  assert.equal(video.codec_name, "h264");
  assert.equal(audio.codec_name, "aac");
  assert.equal(video.width, timeline.width);
  assert.equal(video.height, timeline.height);
  const [num, den] = video.avg_frame_rate.split("/").map(Number);
  assert.equal(num / den, timeline.fps);
  assert.equal(Number(video.nb_frames), totalFrames);
  assert(Math.abs(Number(probe.format.duration) - duration) < 0.1, `${id}: incorrect film duration`);
  assert(Math.abs(Number(audio.duration) - duration) < 0.1, `${id}: incorrect audio duration`);
  const end = rawFrame(["-sseof", "-0.1", "-i", file], "reverse,scale=192:108");
  assert.equal(end.length, paper.length, `${id}: could not decode final frame`);
  const difference = end.reduce((sum, value, index) => sum + Math.abs(value - paper[index]), 0) / end.length;
  assert(difference < 5, `${id}: final frame is not blank paper (mean RGB difference ${difference.toFixed(2)})`);
  const pcm = execFileSync("ffmpeg", ["-v", "error", "-sseof", "-1", "-i", file, "-vn", "-ac", "2", "-ar", "48000", "-f", "f32le", "pipe:1"]);
  assert(pcm.length >= 47_000 * 2 * 4, `${id}: final audio second is missing`);
  let energy = 0;
  let peak = 0;
  for (let offset = 0; offset < pcm.length; offset += 4) {
    const sample = pcm.readFloatLE(offset);
    energy += sample ** 2;
    peak = Math.max(peak, Math.abs(sample));
  }
  const meanDb = 10 * Math.log10(energy / (pcm.length / 4));
  const peakDb = 20 * Math.log10(peak);
  assert(meanDb < -40, `${id}: final second mean is ${meanDb.toFixed(1)} dBFS, expected below -40 dBFS`);
  assert(peakDb < -40, `${id}: final second peak is ${peakDb.toFixed(1)} dBFS, expected below -40 dBFS`);
  console.log(`${id}: ${duration.toFixed(3)} s, ${video.width}x${video.height}, ${timeline.fps} fps, blank paper, final audio mean ${meanDb.toFixed(1)} dBFS, peak ${peakDb.toFixed(1)} dBFS`);
}
