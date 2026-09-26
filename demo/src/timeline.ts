// The tempo map shared by the picture and the score (music/score.py reads the same JSON).
// Every cut and animation lands on a bar or eighth of the barcarolle.
import data from "./timeline.json";

export type SceneId = "P1" | "P2" | "P3" | "P4" | "P5" | "P6" | "P7";

export type Scene = {
  id: SceneId;
  startBar: number;
  bars: number;
  clock: string;
};

export const timeline = data as unknown as {
  fps: number;
  dottedQuarterBpm: number;
  eighthsPerBar: number;
  bars: number;
  tailSeconds: number;
  scenes: Scene[];
  cues: Record<string, [bar: number, eighth: number]>;
  /** The ferry trips: the cue each one starts on, and the Spaces it goes from and to. */
  moves: Record<string, [from: number, to: number]>;
};

export const FPS = timeline.fps;
export const SECONDS_PER_EIGHTH = 60 / timeline.dottedQuarterBpm / 3;
export const SECONDS_PER_BAR = SECONDS_PER_EIGHTH * timeline.eighthsPerBar;
export const FRAMES_PER_EIGHTH = SECONDS_PER_EIGHTH * FPS;
export const FRAMES_PER_BAR = SECONDS_PER_BAR * FPS;
export const TOTAL_FRAMES = Math.ceil((timeline.bars * SECONDS_PER_BAR + timeline.tailSeconds) * FPS);

export const scenes = timeline.scenes;

/** Seconds from the start of the film to `eighth` (may be fractional) of 1-based `bar`. */
export const positionSeconds = (bar: number, eighth = 0) =>
  ((bar - 1) * timeline.eighthsPerBar + eighth) * SECONDS_PER_EIGHTH;

export const positionFrame = (bar: number, eighth = 0) => Math.round(positionSeconds(bar, eighth) * FPS);

/** Duration of `eighths` eighth notes, in frames. */
export const eighths = (count: number) => Math.round(count * FRAMES_PER_EIGHTH);

const cue = (name: string) => {
  const position = timeline.cues[name];
  if (!position) throw new Error(`unknown cue: ${name}`);
  return position;
};

export const cueSeconds = (name: string) => positionSeconds(...cue(name));
export const cueFrame = (name: string) => positionFrame(...cue(name));

/** The Spaces the ferry trip starting on cue `name` goes between. */
export const move = (name: string) => {
  const spaces = timeline.moves[name];
  if (!spaces) throw new Error(`no move starts on cue: ${name}`);
  const [from, to] = spaces;
  return { from, to };
};

export const sceneStartFrame = (scene: Scene) => positionFrame(scene.startBar);
export const sceneEndFrame = (scene: Scene) =>
  scene === scenes[scenes.length - 1] ? TOTAL_FRAMES : positionFrame(scene.startBar + scene.bars);

export const sceneAt = (frame: number) =>
  scenes.find((s) => frame >= sceneStartFrame(s) && frame < sceneEndFrame(s)) ?? scenes[scenes.length - 1];

export const sceneById = (id: SceneId) => scenes.find((s) => s.id === id)!;
