import { describe, expect, it } from "vitest";
import { subsetsFor } from "./fonts";

const ranges = {
  "[1]": "U+4e00-4e0f, U+4e2d",
  "[2]": "U+7a7a",
  latin: "U+0000-00FF",
};

describe("subsetsFor", () => {
  it("keeps only subsets that cover a character of the text", () => {
    expect(subsetsFor("一中", ranges)).toEqual(["[1]"]);
  });

  it("matches single code points and ranges, case-insensitively", () => {
    expect(subsetsFor("空A", ranges).sort()).toEqual(["[2]", "latin"]);
  });

  it("returns nothing for text the font does not cover", () => {
    expect(subsetsFor("😀", ranges)).toEqual([]);
  });
});
