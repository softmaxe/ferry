import data from "./timeline.json";

export type BeatId = "B1" | "B2" | "B3" | "B4" | "B5" | "B6";
export type Position = [bar: number, eighth: number];
export type CueType = "key_click" | "return" | "horn" | "dock" | "pen" | "tick" | "pop" | "arrival";
export type Beat = { id: BeatId; name: string; startBar: number; bars: number; clock: string };
export type Caption = { id: string; beat: BeatId; start: Position; end: Position };
export type Cue = {
  id: string;
  beat: BeatId;
  at: Position;
  type: CueType;
  space?: number;
  move?: { from: number; to: number; follow: boolean };
};
export const timeline = data as {
  fps: number; width: number; height: number; dottedQuarterBpm: number;
  eighthsPerBar: number; bars: number; beats: Beat[]; captions: Caption[]; cues: Cue[];
};
export const FPS = timeline.fps;
export const SECONDS_PER_EIGHTH = 60 / timeline.dottedQuarterBpm / 3;
export const SECONDS_PER_BAR = SECONDS_PER_EIGHTH * timeline.eighthsPerBar;
export const TOTAL_FRAMES = Math.ceil(timeline.bars * SECONDS_PER_BAR * FPS);
export const DURATION_SECONDS = TOTAL_FRAMES / FPS;
export const beats = timeline.beats;
export const positionSeconds = (bar: number, eighth = 0) => ((bar - 1) * timeline.eighthsPerBar + eighth) * SECONDS_PER_EIGHTH;
export const positionFrame = (bar: number, eighth = 0) => Math.round(positionSeconds(bar, eighth) * FPS);
export const eighths = (count: number) => Math.round(count * SECONDS_PER_EIGHTH * FPS);
export const beatById = (id: BeatId) => beats.find((beat) => beat.id === id)!;
export const beatStartFrame = (beat: Beat) => positionFrame(beat.startBar);
export const beatEndFrame = (beat: Beat) => beat === beats.at(-1) ? TOTAL_FRAMES : positionFrame(beat.startBar + beat.bars);
export const beatAt = (frame: number) => beats.find((beat) => frame >= beatStartFrame(beat) && frame < beatEndFrame(beat)) ?? beats.at(-1)!;
export const cue = (id: string): Cue => {
  const item = timeline.cues.find((entry) => entry.id === id);
  if (!item) throw new Error(`Unknown cue: ${id}`);
  return item;
};
export const cueSeconds = (id: string) => positionSeconds(...cue(id).at);
export const cueFrame = (id: string) => positionFrame(...cue(id).at);
export const move = (id: string) => {
  const trip = cue(id).move;
  if (!trip) throw new Error(`No move starts on cue: ${id}`);
  return trip;
};
export const captionAt = (frame: number) => timeline.captions.find((caption) => frame >= positionFrame(...caption.start) && frame < positionFrame(...caption.end));
