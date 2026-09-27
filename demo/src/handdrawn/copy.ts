export type Lang = "en" | "zh";
export const ferryCommandTitle = (space: number) => `Ferry Window to Space ${space}`;
const en = {
  captions: {
    opening: "There has to be a faster way.",
    title: "Any window. Any Space. One keystroke.",
    raycast: "Run it from Raycast.",
    crossing: "Your window, from Pier 1 to Pier 2.",
    hotkeys: "Give each Space a hotkey.",
    follow: "Send it. Follow it.",
    stay: "Or send it and stay put.",
    guarantees: "Runs once, then gets out of your way.",
    close: "A small helper for the way you work.",
  },
  tagline: ["Any window.", "Any Space.", "One keystroke."],
  badges: ["No daemon", "SIP stays on", "Runs once, then exits"],
  endLine: "macOS 26 · Apple silicon",
  pier: "Pier",
  windows: { chat: "Team chat", docs: "API docs", code: "editor", design: "Design review", call: "Weekly sync", terminal: "Terminal" },
};
export type Copy = typeof en;
const zh: Copy = {
  captions: {
    opening: "一定有更快的办法。",
    title: "一个按键，把窗口送到任意 Space。",
    raycast: "在 Raycast 里直接运行。",
    crossing: "把窗口从 1 号码头送到 2 号码头。",
    hotkeys: "给每个 Space 配一个快捷键。",
    follow: "送过去，跟过去。",
    stay: "也可以送走它，自己留在原地。",
    guarantees: "运行一次，就退出。",
    close: "让窗口移动，顺手一点。",
  },
  tagline: ["一个按键，", "把窗口送到", "任意 Space。"],
  badges: ["没有常驻进程", "SIP 保持开启", "运行一次就退出"],
  endLine: "macOS 26 · Apple silicon",
  pier: "码头",
  windows: { chat: "团队聊天", docs: "API 文档", code: "编辑器", design: "设计评审", call: "每周例会", terminal: "终端" },
};
export const copy: Record<Lang, Copy> = { en, zh };
export const allStrings = (value: unknown): string[] => typeof value === "string" ? [value] : value && typeof value === "object" ? Object.values(value).flatMap(allStrings) : [];
export const captionText = (lang: Lang, id: string) => {
  const text = copy[lang].captions[id as keyof Copy["captions"]];
  if (!text) throw new Error(`Unknown caption: ${lang}/${id}`);
  return text;
};
