// Google serves CJK fonts in ~100 unicode-range slices; load only the slices the copy uses.

const parseRange = (token: string): [number, number] => {
  const [lo, hi = lo] = token.trim().replace(/^U\+/i, "").split("-");
  return [parseInt(lo, 16), parseInt(hi, 16)];
};

export const subsetsFor = (text: string, unicodeRanges: Record<string, string>): string[] => {
  const codePoints = [...new Set([...text].map((ch) => ch.codePointAt(0)!))];
  return Object.entries(unicodeRanges)
    .filter(([, ranges]) => {
      const parsed = ranges.split(",").map(parseRange);
      return codePoints.some((cp) => parsed.some(([lo, hi]) => cp >= lo && cp <= hi));
    })
    .map(([subset]) => subset);
};
