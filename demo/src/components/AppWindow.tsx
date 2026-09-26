import type { ReactNode } from "react";
import { C, FONT } from "../theme";

export type WindowKind = "docs" | "code" | "chat" | "design" | "music" | "call" | "terminal";

const DARK: Record<WindowKind, boolean> = {
  docs: false,
  code: true,
  chat: false,
  design: false,
  music: false,
  call: true,
  terminal: true,
};

const BAR = 56;

const Bars = ({ x, y, widths, gap = 30, h = 12, fill, opacity = 1 }: {
  x: number;
  y: number;
  widths: number[];
  gap?: number;
  h?: number;
  fill: string;
  opacity?: number;
}) => (
  <g fill={fill} opacity={opacity}>
    {widths.map((w, i) => (
      <rect key={i} x={x} y={y + i * gap} width={w} height={h} rx={h / 2} />
    ))}
  </g>
);

const Face = ({ cx, cy, hair, skin, r = 70 }: { cx: number; cy: number; hair: string; skin: string; r?: number }) => (
  <g>
    <circle cx={cx} cy={cy + r * 0.2} r={r} fill={skin} />
    <path d={`M ${cx - r} ${cy + r * 0.1} Q ${cx - r * 1.05} ${cy - r * 1.05} ${cx} ${cy - r * 0.85} Q ${cx + r * 1.05} ${cy - r * 1.05} ${cx + r} ${cy + r * 0.1} Q ${cx + r * 0.5} ${cy - r * 0.45} ${cx} ${cy - r * 0.4} Q ${cx - r * 0.5} ${cy - r * 0.45} ${cx - r} ${cy + r * 0.1} Z`} fill={hair} />
    <circle cx={cx - r * 0.32} cy={cy + r * 0.15} r={r * 0.08} fill={C.navyInk} />
    <circle cx={cx + r * 0.32} cy={cy + r * 0.15} r={r * 0.08} fill={C.navyInk} />
    <path d={`M ${cx - r * 0.25} ${cy + r * 0.5} Q ${cx} ${cy + r * 0.7} ${cx + r * 0.25} ${cy + r * 0.5}`} stroke={C.navyInk} strokeWidth={r * 0.07} fill="none" strokeLinecap="round" />
    <path d={`M ${cx - r * 1.4} ${cy + r * 2.2} Q ${cx - r * 1.3} ${cy + r * 1.2} ${cx} ${cy + r * 1.25} Q ${cx + r * 1.3} ${cy + r * 1.2} ${cx + r * 1.4} ${cy + r * 2.2} Z`} fill={hair === C.hair ? C.coral : C.navy} opacity={0.9} />
  </g>
);

const Content = ({ kind, w, h, frame, lines }: { kind: WindowKind; w: number; h: number; frame: number; lines?: ReactNode }) => {
  const top = BAR;
  const bodyH = h - top;
  switch (kind) {
    case "docs":
      return (
        <g>
          <rect x={0} y={top} width={220} height={bodyH} fill="#F3F5F8" />
          <Bars x={30} y={top + 34} widths={[120, 150, 100, 140, 90, 130]} gap={40} fill={C.gray} opacity={0.6} />
          <rect x={260} y={top + 40} width={w * 0.42} height={30} rx={8} fill={C.navy} />
          <Bars x={260} y={top + 100} widths={[w - 320, w - 380, w - 340, w * 0.4]} fill={C.grayLight} h={13} />
          <rect x={260} y={top + 240} width={w - 300} height={Math.min(170, bodyH - 290)} rx={14} fill={C.navyInk} />
          <Bars x={290} y={top + 270} widths={[180, 260, 140, 220]} gap={30} fill={C.coral} opacity={0.9} h={12} />
          <Bars x={260} y={top + 440} widths={[w - 340, w - 400]} fill={C.grayLight} h={13} />
        </g>
      );
    case "code": {
      const palette = [C.coral, "#F5E0A0", "#93CBAE", "#B7A7E3", C.seaLight];
      const rows = Math.floor((bodyH - 40) / 34);
      return (
        <g>
          <rect x={0} y={top} width={w} height={bodyH} fill="#15253F" />
          <rect x={0} y={top} width={200} height={bodyH} fill="#0F1C31" />
          <Bars x={28} y={top + 30} widths={[110, 90, 130, 80, 120, 100]} gap={38} fill="#3B5378" />
          {Array.from({ length: rows }).map((_, i) => {
            const indent = [0, 1, 2, 2, 1, 2, 3, 3, 2, 1, 0, 1, 2, 1, 0][i % 15] * 34;
            const a = 60 + ((i * 53) % 140);
            const b = 40 + ((i * 97) % 180);
            return (
              <g key={i}>
                <rect x={228} y={top + 26 + i * 34} width={22} height={10} rx={5} fill="#3B5378" />
                <rect x={280 + indent} y={top + 26 + i * 34} width={a} height={12} rx={6} fill={palette[i % 5]} />
                {i % 3 !== 2 && <rect x={290 + indent + a} y={top + 26 + i * 34} width={b} height={12} rx={6} fill={palette[(i + 2) % 5]} opacity={0.75} />}
              </g>
            );
          })}
          {Math.floor(frame / 30) % 2 === 0 && <rect x={560} y={top + 26 + 6 * 34 - 6} width={4} height={24} fill={C.cream} />}
        </g>
      );
    }
    case "chat":
      return (
        <g>
          <rect x={0} y={top} width={220} height={bodyH} fill={C.navy} />
          <Bars x={28} y={top + 34} widths={[120, 90, 140, 100, 80]} gap={42} fill={C.cream} opacity={0.5} />
          {[
            [C.coral, 0.62],
            ["#93CBAE", 0.48],
            [C.navy, 0.7],
          ].map(([color, frac], i) => (
            <g key={i} transform={`translate(250 ${top + 36 + i * 118})`}>
              <circle cx={26} cy={26} r={26} fill={color as string} />
              <rect x={70} y={4} width={120} height={14} rx={7} fill={C.navyInk} opacity={0.7} />
              <rect x={70} y={32} width={(w - 340) * (frac as number)} height={40} rx={14} fill="#EEF1F6" />
            </g>
          ))}
          <rect x={250} y={h - 80} width={w - 280} height={52} rx={16} fill="#F3F5F8" stroke={C.grayLight} strokeWidth={2} />
        </g>
      );
    case "design":
      return (
        <g>
          <rect x={0} y={top} width={w} height={bodyH} fill="#ECEEF3" />
          <rect x={w - 200} y={top} width={200} height={bodyH} fill={C.white} />
          <Bars x={w - 176} y={top + 30} widths={[100, 150, 120, 150, 90, 140]} gap={40} fill={C.grayLight} />
          <rect x={60} y={top + 50} width={w - 330} height={bodyH - 100} rx={10} fill={C.white} />
          <circle cx={60 + (w - 330) * 0.3} cy={top + 50 + (bodyH - 100) * 0.45} r={Math.min(90, bodyH * 0.2)} fill={C.coral} />
          <rect x={60 + (w - 330) * 0.52} y={top + 50 + (bodyH - 100) * 0.25} width={(w - 330) * 0.3} height={(bodyH - 100) * 0.35} rx={16} fill={C.navy} />
          <path d={`M ${60 + (w - 330) * 0.5} ${top + bodyH - 90} l 70 -110 l 70 110 Z`} fill="#F5C95C" />
          <rect x={60 + (w - 330) * 0.52 - 4} y={top + 50 + (bodyH - 100) * 0.25 - 4} width={(w - 330) * 0.3 + 8} height={(bodyH - 100) * 0.35 + 8} rx={18} fill="none" stroke="#4C8DFF" strokeWidth={3} />
        </g>
      );
    case "music": {
      const art = Math.min(bodyH - 80, w * 0.42);
      return (
        <g>
          <rect x={40} y={top + 40} width={art} height={art} rx={18} fill="#F2A477" />
          <rect x={40} y={top + 40 + art * 0.6} width={art} height={art * 0.4} fill="#E5876A" />
          <circle cx={40 + art * 0.62} cy={top + 40 + art * 0.6} r={art * 0.14} fill="#FFE2A8" />
          <rect x={40} y={top + 40 + art - 18} width={art} height={18} fill="#E5876A" />
          <rect x={80 + art} y={top + 60} width={w - art - 130} height={26} rx={8} fill={C.navyInk} />
          <rect x={80 + art} y={top + 104} width={(w - art - 130) * 0.6} height={16} rx={8} fill={C.gray} />
          <rect x={80 + art} y={top + art - 20} width={w - art - 130} height={8} rx={4} fill={C.grayLight} />
          <rect x={80 + art} y={top + art - 20} width={(w - art - 130) * ((frame % 600) / 600)} height={8} rx={4} fill={C.coral} />
          <circle cx={80 + art + (w - art - 130) / 2} cy={top + art + 30} r={30} fill={C.navy} />
          <path d={`M ${80 + art + (w - art - 130) / 2 - 8} ${top + art + 16} l 22 14 l -22 14 Z`} fill={C.cream} />
        </g>
      );
    }
    case "call": {
      const tw = (w - 36) / 2;
      const th = (bodyH - 110) / 2;
      const people = [
        [C.hair, C.skin],
        ["#8C4A2F", "#C98B63"],
        ["#E6C56E", "#F2CFB3"],
        ["#3C3C4A", "#8D5A3F"],
      ];
      return (
        <g>
          <rect x={0} y={top} width={w} height={bodyH} fill="#1B2436" />
          {people.map(([hair, skin], i) => {
            const tx = 12 + (i % 2) * (tw + 12);
            const ty = top + 12 + Math.floor(i / 2) * (th + 12);
            return (
              <g key={i}>
                <svg x={tx} y={ty} width={tw} height={th} overflow="hidden">
                  <rect width={tw} height={th} rx={14} fill={["#2F4468", "#46385F", "#2E5352", "#5A3E3E"][i]} />
                  <Face cx={tw / 2} cy={th / 2 - 10 + Math.sin((frame + i * 40) / 25) * 3} hair={hair} skin={skin} r={Math.min(th, tw) * 0.2} />
                </svg>
                <rect x={tx + 14} y={ty + th - 40} width={90} height={26} rx={8} fill="#000" opacity={0.35} />
              </g>
            );
          })}
          <g transform={`translate(${w / 2} ${h - 45})`}>
            <circle cx={-90} cy={0} r={26} fill="#34405A" />
            <circle cx={0} cy={0} r={26} fill="#34405A" />
            <rect x={60} y={-22} width={90} height={44} rx={22} fill={C.macRed} />
          </g>
        </g>
      );
    }
    case "terminal":
      return (
        <g>
          <rect x={0} y={top} width={w} height={bodyH} fill="#0F1B2E" />
          <g fontFamily={FONT.mono} fontSize={24} fill="#D6E2F0" style={{ fontVariantLigatures: "none" }}>
            {lines}
          </g>
        </g>
      );
  }
};

type Props = {
  kind: WindowKind;
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  frame: number;
  focused?: boolean;
  /** Terminal text, positioned in window coordinates. */
  lines?: ReactNode;
  opacity?: number;
  scale?: number;
  rotate?: number;
};

export const AppWindow = ({ kind, x, y, w, h, title, frame, focused = true, lines, opacity = 1, scale = 1, rotate = 0 }: Props) => {
  const dark = DARK[kind];
  const cx = x + w / 2;
  const cy = y + h / 2;
  // Same size → same clip geometry, so duplicate ids across windows are harmless.
  const clipId = `wclip-${Math.round(w)}-${Math.round(h)}`;
  return (
    <g opacity={opacity} transform={`translate(${cx} ${cy}) rotate(${rotate}) scale(${scale}) translate(${-cx} ${-cy})`}>
      <rect x={x} y={y + 18} width={w} height={h} rx={22} fill={C.navyInk} opacity={focused ? 0.2 : 0.1} />
      <svg x={x} y={y} width={w} height={h} overflow="hidden">
        <defs>
          <clipPath id={clipId}>
            <rect width={w} height={h} rx={22} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <rect width={w} height={h} fill={dark ? "#1E2B42" : C.white} />
          <Content kind={kind} w={w} h={h} frame={frame} lines={lines} />
          <rect width={w} height={BAR} fill={dark ? "#243350" : "#F6F7F9"} />
        </g>
        {[C.macRed, C.macYellow, C.macGreen].map((color, i) => (
          <circle key={i} cx={30 + i * 28} cy={BAR / 2} r={9} fill={focused ? color : "#C5CAD3"} />
        ))}
        <text x={w / 2} y={BAR / 2 + 7} textAnchor="middle" fontFamily={FONT.ui} fontWeight={600} fontSize={20} fill={dark ? "#B9C6DA" : "#5B6474"}>
          {title}
        </text>
      </svg>
      <rect x={x} y={y} width={w} height={h} rx={22} fill="none" stroke={dark ? "#33476B" : "#D5DAE2"} strokeWidth={2} />
    </g>
  );
};
