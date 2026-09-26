import { describe, expect, it } from "vitest";
import { allStrings as strings, copy, ferryCommandTitle, type Copy } from "./copy";

const shape = (value: unknown): unknown =>
  typeof value === "string"
    ? "string"
    : Array.isArray(value)
      ? "array"
      : value && typeof value === "object"
        ? Object.fromEntries(Object.entries(value).map(([k, v]) => [k, shape(v)]))
        : typeof value;

describe("copy", () => {
  it("has the same keys in every language", () => {
    expect(shape(copy.zh)).toEqual(shape(copy.en));
  });

  it("has no empty strings", () => {
    for (const lang of Object.keys(copy) as (keyof typeof copy)[]) {
      for (const s of strings(copy[lang] satisfies Copy)) expect(s.trim()).not.toBe("");
    }
  });

  // CONTEXT.md: "Space" is the only word for a Mission Control desktop, in both languages.
  it("follows the glossary in English", () => {
    for (const s of strings(copy.en)) expect(s).not.toMatch(/desktop|workspace|active window/i);
  });

  it("follows the glossary in Chinese", () => {
    for (const s of strings(copy.zh)) expect(s).not.toMatch(/桌面|空间|当前窗口|快捷指令/);
  });

  it("keeps Ferry command names in English, as Raycast shows them", () => {
    expect(ferryCommandTitle(3)).toBe("Ferry Window to Space 3");
  });
});
