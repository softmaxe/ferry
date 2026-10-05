import { describe, expect, it } from "vitest";
import { allStrings as strings, copy, type Copy } from "./copy";

describe("copy", () => {
  it("has no empty strings", () => {
    for (const lang of Object.keys(copy) as (keyof typeof copy)[]) {
      for (const s of strings(copy[lang] satisfies Copy)) expect(s.trim()).not.toBe("");
    }
  });

  // GLOSSARY.md: "Space" is the only word for a Mission Control desktop, in both languages.
  it("follows the glossary in English", () => {
    for (const s of strings(copy.en)) expect(s).not.toMatch(/desktop|workspace|active window/i);
  });

  it("follows the glossary in Chinese", () => {
    for (const s of strings(copy.zh)) expect(s).not.toMatch(/桌面|空间|当前窗口|快捷指令/);
  });
});
