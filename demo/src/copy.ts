// On-screen text for each language. Terms follow CONTEXT.md; anything a real program prints
// (Raycast command names, ferry output, shell commands) stays in English in both versions.

export type Lang = "en" | "zh";

export const ferryCommandTitle = (space: number) => `Ferry Window to Space ${space}`;

const en = {
  p1Caption: "There has to be a faster way.",
  tagline: ["Any window.", "Any Space.", "One keystroke."],
  p3Caption: "Run it from Raycast.",
  p4Caption: "Give each Space a hotkey.",
  p5Caption: "Send it. Follow it.",
  p6Caption: "Or send it and stay put.",
  badges: ["No daemon", "SIP stays on", "Runs once, then exits"],
  endLine: "macOS 26 · Apple silicon",
  windows: {
    chat: "Team chat",
    docs: "API docs",
    code: "editor",
    design: "Design review",
    moodboard: "Moodboard",
    dm: "Direct message",
    music: "Focus playlist",
    call: "Weekly sync",
    terminal: "Terminal",
  },
};

export type Copy = typeof en;

const zh: Copy = {
  p1Caption: "一定有更快的办法。",
  tagline: ["一个按键，", "把窗口送到", "任意 Space。"],
  p3Caption: "在 Raycast 里直接运行。",
  p4Caption: "给每个 Space 配一个快捷键。",
  p5Caption: "送过去，跟过去。",
  p6Caption: "也可以送走它，自己留在原地。",
  badges: ["没有常驻进程", "SIP 保持开启", "运行一次就退出"],
  endLine: "macOS 26 · Apple silicon",
  windows: {
    chat: "团队聊天",
    docs: "API 文档",
    code: "编辑器",
    design: "设计评审",
    moodboard: "灵感板",
    dm: "私信",
    music: "专注歌单",
    call: "每周例会",
    terminal: "终端",
  },
};

export const copy: Record<Lang, Copy> = { en, zh };

/** Every string inside a copy value, in declaration order. */
export const allStrings = (value: unknown): string[] =>
  typeof value === "string"
    ? [value]
    : value && typeof value === "object"
      ? Object.values(value).flatMap(allStrings)
      : [];
