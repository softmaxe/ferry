// Ferry logo colors and the existing Space colors keep the harbor recognizable.
export const C = {
  navy: "#0E3A6B", navyDeep: "#0A2A4F", navyInk: "#132544",
  coral: "#FF5B41", coralDeep: "#E4452D", cream: "#F8EEDF",
  paper: "#F8EEDF", paperShade: "#EFE0CA", whitePaper: "#FFFAF2",
  pencil: "#6B6570", graphite: "#283B51", ink: "#132544",
  accent: "#D84632", sea: "#2F6F9F", seaLight: "#5E9CC6", foam: "#DCEBF3",
  sunsetGold: "#F2B45A", sunsetRose: "#E98A6C", sunsetPlum: "#8C5A7A",
};
export const PALETTE = C;
export const SPACE_COLORS: Record<number, { wall: string; deep: string }> = {
  1: { wall: "#F6C9AA", deep: "#E9A987" }, 2: { wall: "#BFE3D0", deep: "#93CBAE" },
  3: { wall: "#D8CDF1", deep: "#B7A7E3" }, 4: { wall: "#F5E0A0", deep: "#E6C56E" },
  5: { wall: "#F4BCC6", deep: "#E596A5" },
};
export const FONT = {
  hand: "'LXGW WenKai', cursive",
  ui: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
  mono: "'SFMono-Regular', Menlo, monospace",
};
