import type { ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { copy, type Lang } from "../copy";
import { beatById, type BeatId } from "../timeline";
import type { BeatProps } from "./types";

/** Render the same visible SVG text used by the film, without a browser or font loader. */
export const sceneSvg = (Scene: ComponentType<BeatProps>, frame: number, lang: Lang, beatId: BeatId) =>
  renderToStaticMarkup(<Scene frame={frame} lang={lang} text={copy[lang]} beat={beatById(beatId)} />);

const decodeText = (value: string) => value
  .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
  .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
  .replace(/&quot;/g, '"').replace(/&#x27;|&apos;/g, "'")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

const visibleText = (svg: string, attribute: string) =>
  [...svg.matchAll(new RegExp(`<text\\b[^>]* ${attribute}="true"[^>]*>([^<]*)<\\/text>`, "g"))]
    .map((match) => decodeText(match[1]));

export const windowTitles = (svg: string) => visibleText(svg, "data-window-title");
export const menuTitles = (svg: string) => visibleText(svg, "data-menu-title");
/** Main menu first; callers mount any inset menu after the main scene. */
export const menuSpaces = (svg: string) => visibleText(svg, "data-menu-space").map((label) => Number(label.replace(/^Space /, "")));
