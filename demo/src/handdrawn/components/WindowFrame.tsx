import { useId, type ReactNode } from "react";
import { pencilSeed } from "../anim";
import type { Lang } from "../copy";
import { RoughDrawing } from "../rough";
import { C, FONT } from "../theme";

export type WindowKind = "docs" | "code" | "chat" | "design" | "call" | "terminal";
export const WINDOW_TITLE_H = 64;

export interface WindowFrameProps {
  x: number; y: number; w: number; h: number; title: string;
  kind?: WindowKind; lang?: Lang; frame?: number; focused?: boolean;
  scale?: number; rotate?: number; opacity?: number; seed?: number;
  /** Body-local coordinates: (0, 0) is directly below the title bar. */
  children?: ReactNode;
}

/** Pencil chrome around crisp UI text. Every visible window owns one title text. */
export const WindowFrame = ({
  x, y, w, h, title, kind = "docs", lang = "en", frame = 0, focused = true,
  scale = 1, rotate = 0, opacity = 1, seed = 200, children,
}: WindowFrameProps) => {
  const clipId = `window-body-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const dark = kind === "terminal" || kind === "code";
  const bodyH = Math.max(0, h - WINDOW_TITLE_H);
  const titleSize = Math.max(16, Math.min(28, (w - 235) / Math.max(1, [...title].length) / 0.6));
  return (
    <g data-window-kind={kind} data-focused={focused ? "true" : "false"} opacity={opacity}
      transform={`translate(${x + w / 2} ${y + h / 2}) rotate(${rotate}) scale(${scale}) translate(${-w / 2} ${-h / 2})`}>
      <defs><clipPath id={clipId}><rect width={w - 4} height={bodyH - 2} x={2} /></clipPath></defs>
      <rect width={w} height={h} fill={dark ? C.navyDeep : C.whitePaper} />
      <rect width={w} height={WINDOW_TITLE_H} fill={focused ? C.paper : C.paperShade} />
      <g transform={`translate(0 ${WINDOW_TITLE_H})`} clipPath={`url(#${clipId})`}>
        {children ?? <WindowContent kind={kind} w={w} h={bodyH} lang={lang} />}
      </g>
      <RoughDrawing seed={pencilSeed(seed, frame)} deps={[w, h]} options={{ stroke: C.graphite, strokeWidth: focused ? 3.1 : 2, roughness: 0.85, bowing: 0.5 }}
        build={(g, o) => [g.rectangle(0, 0, w, h, o), g.line(0, WINDOW_TITLE_H, w, WINDOW_TITLE_H, o)]} />
      {[C.coral, C.sunsetGold, "#93CBAE"].map((color, i) => (
        <circle key={color} cx={28 + i * 30} cy={WINDOW_TITLE_H / 2} r={9} fill={focused ? color : C.pencil} opacity={focused ? 1 : 0.4} stroke={C.graphite} strokeWidth={1.4} />
      ))}
      <text data-window-title="true" x={w / 2 + 30} y={42} textAnchor="middle" fontFamily={FONT.ui} fontWeight={600} fontSize={titleSize} fill={C.navyInk}>{title}</text>
    </g>
  );
};

const RuleLines = ({ x, y, widths, gap = 28, color = C.pencil }: { x: number; y: number; widths: number[]; gap?: number; color?: string }) => (
  <g stroke={color} strokeWidth={3} opacity={0.35}>
    {widths.map((width, i) => <path key={i} d={`M${x} ${y + i * gap} h${width}`} />)}
  </g>
);

const WindowContent = ({ kind, w, h, lang }: { kind: WindowKind; w: number; h: number; lang: Lang }) => {
  if (kind === "docs") {
    const side = w * 0.23;
    const contentX = side + 34;
    return (
      <g fontFamily={FONT.ui} fill={C.navyInk}>
        <rect width={side} height={h} fill={C.paperShade} opacity={0.48} />
        {(lang === "zh" ? ["概览", "请求", "响应"] : ["Overview", "Requests", "Responses"]).map((item, i) => <text key={item} x={24} y={54 + i * 53} fontSize={23}>{item}</text>)}
        <text x={contentX} y={57} fontSize={34} fontWeight={600}>{lang === "zh" ? "API 参考" : "API reference"}</text>
        <RuleLines x={contentX} y={95} widths={[w * 0.53, w * 0.48, w * 0.55]} />
        <rect x={contentX} y={182} width={w - contentX - 34} height={Math.max(65, h - 254)} fill={C.paperShade} opacity={0.5} />
        <text x={contentX + 22} y={227} fontFamily={FONT.mono} fontSize={25} fill={C.navy}>GET /v1/events</text>
        {h > 330 && <text x={contentX + 22} y={279} fontFamily={FONT.mono} fontSize={23} fill={C.coralDeep}>200 OK</text>}
      </g>
    );
  }
  if (kind === "code" || kind === "terminal") {
    const lines = kind === "code" ? ["export function hello() {", "  return 'hello';", "}"] : ["$ ferry --help", "Usage: ferry [options] SPACE"];
    return <g fontFamily={FONT.mono} fontSize={26} fill={C.whitePaper}>{lines.map((line, i) => <text key={line} x={32} y={57 + i * 47} fill={i === 1 ? C.sunsetGold : C.whitePaper}>{line}</text>)}</g>;
  }
  if (kind === "chat") {
    return (
      <g>
        <rect width={w * 0.2} height={h} fill={C.navy} opacity={0.08} />
        <RuleLines x={24} y={42} widths={[w * 0.12, w * 0.13, w * 0.1, w * 0.13]} gap={43} />
        {[C.coral, C.sea, "#93CBAE"].map((color, i) => <g key={color}>
          <circle cx={w * 0.26} cy={55 + i * h * 0.26} r={18} fill={color} opacity={0.75} />
          <RuleLines x={w * 0.31} y={47 + i * h * 0.26} widths={[w * 0.19, w * (0.5 - i * 0.06)]} gap={26} />
        </g>)}
      </g>
    );
  }
  if (kind === "call") {
    const tileW = (w - 54) / 2;
    const tileH = (h - 75) / 2;
    return <g>{[C.sunsetRose, C.seaLight, "#93CBAE", "#B7A7E3"].map((color, i) => (
      <g key={color} transform={`translate(${18 + i % 2 * (tileW + 18)} ${16 + Math.floor(i / 2) * (tileH + 16)})`}>
        <rect width={tileW} height={tileH} fill={color} opacity={0.23} />
        <circle cx={tileW / 2} cy={tileH * 0.37} r={tileH * 0.18} fill={C.paperShade} stroke={C.graphite} strokeWidth={2} />
        <path d={`M${tileW * 0.3} ${tileH * 0.88} Q${tileW * 0.5} ${tileH * 0.33} ${tileW * 0.7} ${tileH * 0.88}`} fill={color} stroke={C.graphite} strokeWidth={2} />
        <circle cx={tileW / 2 - 8} cy={tileH * 0.37} r={2} fill={C.navyInk} /><circle cx={tileW / 2 + 8} cy={tileH * 0.37} r={2} fill={C.navyInk} />
      </g>
    ))}<rect x={w / 2 - 27} y={h - 24} width={54} height={13} rx={6} fill={C.coral} /></g>;
  }
  return <g><circle cx={w * 0.32} cy={h * 0.45} r={Math.min(w, h) * 0.21} fill={C.coral} opacity={0.7} /><rect x={w * 0.57} y={h * 0.22} width={w * 0.22} height={h * 0.45} fill={C.navy} opacity={0.8} /><RuleLines x={w * 0.15} y={h * 0.85} widths={[w * 0.65]} /></g>;
};
