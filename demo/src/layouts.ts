import type { WindowKind } from "./components/AppWindow";
import type { Copy } from "./copy";

export type WinRect = { x: number; y: number; w: number; h: number };
export type WinSpec = WinRect & { kind: WindowKind; title: string };
export type TitleKey = keyof Copy["windows"];

// Where each Space's resident windows sit on the 1920×1080 screen. A Space keeps the same
// arrangement wherever it appears: full screen, harbor card, or mid-swipe.

export const HOME: Record<number, (WinRect & { kind: WindowKind; title: TitleKey })[]> = {
  1: [{ kind: "chat", title: "chat", x: 150, y: 120, w: 980, h: 680 }],
  2: [{ kind: "code", title: "code", x: 80, y: 90, w: 900, h: 800 }],
  3: [{ kind: "design", title: "moodboard", x: 120, y: 100, w: 1100, h: 760 }],
  4: [],
  5: [],
};

/** Window sizes never change when ferry moves them; only the Space and position do. */
export const SIZE: Record<"docs" | "chat" | "design" | "music" | "terminal" | "call", { w: number; h: number }> = {
  docs: { w: 1000, h: 700 },
  chat: { w: 900, h: 620 },
  design: { w: 1000, h: 680 },
  music: { w: 820, h: 520 },
  terminal: { w: 1000, h: 560 },
  call: { w: 1040, h: 720 },
};

/** Where a window that ferry brings to a Space lands. */
export const ARRIVAL: Record<number, { x: number; y: number }> = {
  1: { x: 760, y: 170 },
  2: { x: 870, y: 200 },
  3: { x: 800, y: 260 },
  4: { x: 460, y: 240 },
  5: { x: 550, y: 250 },
};

export const residents = (space: number, text: Copy): WinSpec[] =>
  HOME[space].map((w) => ({ ...w, title: text.windows[w.title] }));
