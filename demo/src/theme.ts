import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { getInfo as notoSansInfo, loadFont as loadNotoSans } from "@remotion/google-fonts/NotoSansSC";
import { getInfo as notoSerifInfo, loadFont as loadNotoSerif } from "@remotion/google-fonts/NotoSerifSC";
import { allStrings, copy } from "./copy";
import { subsetsFor } from "./fonts";

// Brand colors come from docs/assets/ferry-logo.png; the rest are tints that sit beside them.
export const C = {
  navy: "#0E3A6B",
  navyDeep: "#0A2A4F",
  navyInk: "#132544",
  coral: "#FF5B41",
  coralDeep: "#E4452D",
  cream: "#F8EEDF",
  creamDeep: "#EFE0CA",
  paper: "#FFFaf2",
  sea: "#2F6F9F",
  seaLight: "#5E9CC6",
  foam: "#DCEBF3",
  skin: "#EDB892",
  skinShade: "#D99C74",
  hair: "#22314F",
  gray: "#9AA3B2",
  grayLight: "#D9DEE6",
  white: "#FFFFFF",
  macRed: "#FF5F57",
  macYellow: "#FEBC2E",
  macGreen: "#28C840",
  rayBg: "#1D1D20",
  rayRow: "#2E2E33",
  rayText: "#F2F2F4",
  rayMuted: "#8E8E96",
};

// One wallpaper color per Space; the harbor docks reuse them so a Space is recognizable anywhere.
export const SPACE_COLORS: Record<number, { wall: string; deep: string; name: string }> = {
  1: { wall: "#F6C9AA", deep: "#E9A987", name: "chat" },
  2: { wall: "#BFE3D0", deep: "#93CBAE", name: "code" },
  3: { wall: "#D8CDF1", deep: "#B7A7E3", name: "design" },
  4: { wall: "#F5E0A0", deep: "#E6C56E", name: "terminal" },
  5: { wall: "#F4BCC6", deep: "#E596A5", name: "music" },
};

const zhText = allStrings(copy.zh).join("");

loadInter("normal", { weights: ["400", "500", "600", "700", "800"], subsets: ["latin"] });
loadMono("normal", { weights: ["400", "500", "700"], subsets: ["latin"] });
loadFraunces("normal", { weights: ["500", "600", "700"], subsets: ["latin"] });
// The typings only list named subsets, but loadFont also accepts the numbered slice keys.
type CjkSubsets = "chinese-simplified"[];
loadNotoSans("normal", { weights: ["400", "500", "700"], subsets: subsetsFor(zhText, notoSansInfo().unicodeRanges) as CjkSubsets });
loadNotoSerif("normal", { weights: ["600", "700"], subsets: subsetsFor(zhText, notoSerifInfo().unicodeRanges) as CjkSubsets });

export const FONT = {
  ui: "Inter, 'Noto Sans SC', sans-serif",
  display: "Fraunces, 'Noto Serif SC', serif",
  mono: "'JetBrains Mono', monospace",
  // Emoji glyphs come from the system font on the rendering Mac, as they do in Raycast.
  emoji: "'Apple Color Emoji', 'Noto Color Emoji', sans-serif",
};
