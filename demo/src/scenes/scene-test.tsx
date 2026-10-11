import type { ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { vi } from "vitest";
import type { Copy } from "../copy";
import type { SceneProps } from "./types";

// Keep font metadata real; only skip the browser/network font loading side effects.
vi.mock("@remotion/google-fonts/Fraunces", async (original) => ({ ...await original(), loadFont: () => undefined }));
vi.mock("@remotion/google-fonts/Inter", async (original) => ({ ...await original(), loadFont: () => undefined }));
vi.mock("@remotion/google-fonts/JetBrainsMono", async (original) => ({ ...await original(), loadFont: () => undefined }));
vi.mock("@remotion/google-fonts/NotoSansSC", async (original) => ({ ...await original(), loadFont: () => undefined }));
vi.mock("@remotion/google-fonts/NotoSerifSC", async (original) => ({ ...await original(), loadFont: () => undefined }));

export const sceneSvg = (Scene: ComponentType<SceneProps>, frame: number, text: Copy) =>
  renderToStaticMarkup(<Scene frame={frame} text={text} />);

// AppWindow titles and MenuBar labels occupy different rows in their local SVG coordinates.
export const windowTitles = (svg: string) =>
  [...svg.matchAll(/<text\b[^>]* y="35"[^>]* font-weight="600"[^>]*>([^<]*)<\/text>/g)].map((match) => match[1]);

// Shot draws the main screen first, followed by any inset menus in its overlay.
export const menuTitles = (svg: string) =>
  [...svg.matchAll(/<text x="62" y="29"[^>]*>([^<]*)<\/text>/g)].map((match) => match[1]);

export const menuSpaces = (svg: string) =>
  [...svg.matchAll(/<text x="60" y="29"[^>]*>Space (\d+)<\/text>/g)].map((match) => Number(match[1]));
