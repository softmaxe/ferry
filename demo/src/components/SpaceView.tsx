import type { ReactNode } from "react";
import type { Copy } from "../copy";
import { residents, type WinRect } from "../layouts";
import { AppWindow, type WindowKind } from "./AppWindow";
import { Desktop } from "./Desktop";

export type Guest = {
  kind: WindowKind;
  title: string;
  rect: WinRect;
  lines?: ReactNode;
};

/** A Space with its resident windows plus any guests; the last guest has focus. */
export const SpaceView = ({ space, frame, text, clock, guests = [], overlay, menuSpace, ping, pingSpace }: {
  space: number;
  frame: number;
  text: Copy;
  clock: string;
  guests?: Guest[];
  overlay?: ReactNode;
  menuSpace?: number;
  ping?: number;
  pingSpace?: number;
}) => {
  const wins = residents(space, text);
  const focused = guests.length ? guests[guests.length - 1].title : wins[wins.length - 1]?.title ?? "Finder";
  return (
    <Desktop space={space} frame={frame} app={focused} clock={clock} overlay={overlay} menuSpace={menuSpace} ping={ping} pingSpace={pingSpace}>
      {wins.map((w, i) => (
        <AppWindow key={`r${i}`} {...w} frame={frame} focused={!guests.length && i === wins.length - 1} />
      ))}
      {guests.map((g, i) => (
        <AppWindow key={`g${i}`} kind={g.kind} {...g.rect} title={g.title} lines={g.lines} frame={frame} focused={i === guests.length - 1} />
      ))}
    </Desktop>
  );
};
