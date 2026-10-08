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

/** One window's ferry ride between Spaces; see GLOSSARY.md (Trip, Arrival). */
export type TempoTrip = {
  from: number;
  to: number;
  arrival: [bar: number, eighth: number];
};

export const timeline = data as unknown as {
  fps: number;
  dottedQuarterBpm: number;
  eighthsPerBar: number;
  bars: number;
  tailSeconds: number;
  scenes: Scene[];
  cues: Record<string, [bar: number, eighth: number]>;
  /**
   * The Trips, keyed by the cue each one starts on: the source Space, the Destination Space, and
   * the Arrival, where the score rings the Destination Space.
   */
  trips: Record<string, TempoTrip>;
};

export const FPS = timeline.fps;
const SECONDS_PER_EIGHTH = 60 / timeline.dottedQuarterBpm / 3;
const SECONDS_PER_BAR = SECONDS_PER_EIGHTH * timeline.eighthsPerBar;
export const FRAMES_PER_EIGHTH = SECONDS_PER_EIGHTH * FPS;
export const TOTAL_FRAMES = Math.ceil((timeline.bars * SECONDS_PER_BAR + timeline.tailSeconds) * FPS);

export const scenes = timeline.scenes;

/** Seconds from the start of the film to `eighth` (may be fractional) of 1-based `bar`. */
const positionSeconds = (bar: number, eighth = 0) =>
  ((bar - 1) * timeline.eighthsPerBar + eighth) * SECONDS_PER_EIGHTH;

export const positionFrame = (bar: number, eighth = 0) => Math.round(positionSeconds(bar, eighth) * FPS);

/** Duration of `eighths` eighth notes, in frames. */
export const eighths = (count: number) => Math.round(count * FRAMES_PER_EIGHTH);

const cue = (name: string) => {
  const position = timeline.cues[name];
  if (!position) throw new Error(`unknown cue: ${name}`);
  return position;
};

export const cueFrame = (name: string) => positionFrame(...cue(name));

/** The Trip starting on cue `name`. */
export const trip = (name: string): TempoTrip => {
  const found = timeline.trips[name];
  if (!found) throw new Error(`no Trip starts on cue: ${name}`);
  return found;
};

const sceneStartFrame = (scene: Scene) => positionFrame(scene.startBar);
const sceneEndFrame = (scene: Scene) =>
  scene === scenes[scenes.length - 1] ? TOTAL_FRAMES : positionFrame(scene.startBar + scene.bars);

export const sceneAt = (frame: number) =>
  scenes.find((s) => frame >= sceneStartFrame(s) && frame < sceneEndFrame(s)) ?? scenes[scenes.length - 1];

