import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const demoDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const compositionIds = ["ferry-en", "ferry-zh"];
export const timelinePath = path.join(demoDir, "src/handdrawn/timeline.json");
export const timeline = JSON.parse(readFileSync(timelinePath, "utf8"));
export const positionFrame = (bar, eighth = 0) =>
  Math.round(((bar - 1) * timeline.eighthsPerBar + eighth) * 60 / timeline.dottedQuarterBpm / 3 * timeline.fps);
export const totalFrames = Math.ceil(timeline.bars * timeline.eighthsPerBar * 60 / timeline.dottedQuarterBpm / 3 * timeline.fps);
export const duration = totalFrames / timeline.fps;
export const manifestPath = path.join(demoDir, "out/build-manifest.json");
export const fileHash = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");

// Hash render inputs, including fonts and dependency locks. Test-only edits do not invalidate a film.
export function sourceHash() {
  const files = [];
  const visit = (relative) => {
    const absolute = path.join(demoDir, relative);
    if (!existsSync(absolute)) return;
    for (const entry of readdirSync(absolute, { withFileTypes: true })) {
      if ([".venv", "__pycache__", ".pytest_cache", "tests"].includes(entry.name)) continue;
      if (/\.(test|spec)\.[cm]?[jt]sx?$/.test(entry.name)) continue;
      const child = path.join(relative, entry.name);
      if (entry.isDirectory()) visit(child);
      else if (entry.isFile()) files.push(child);
    }
  };
  for (const dir of ["src", "audio", "scripts", "public/fonts"]) visit(dir);
  for (const file of ["package.json", "package-lock.json", "remotion.config.ts", "tsconfig.json"]) {
    if (existsSync(path.join(demoDir, file))) files.push(file);
  }
  const hash = createHash("sha256");
  for (const file of files.sort()) hash.update(file).update("\0").update(readFileSync(path.join(demoDir, file))).update("\0");
  return hash.digest("hex");
}

export const reviewFiles = () => compositionIds.flatMap((id) =>
  timeline.beats.map((beat) => `out/review/${id}-${beat.id}.png`));
export const outputFiles = () => [
  ...compositionIds.map((id) => `out/${id}.mp4`),
  "public/handdrawn.wav", "out/timeline.json", "out/review/paper.png",
  "out/review/contact-sheet.png", ...reviewFiles(),
];
