import type { PlacedWindow } from "../trip";
import { AppWindow } from "./AppWindow";
import { Desktop } from "./Desktop";

/** A Space with `windows` in draw order; the last is the Focused window the menu bar names. */
export const SpaceView = ({ space, frame, clock, windows, ping, pingSpace }: {
  space: number;
  frame: number;
  clock: string;
  windows: PlacedWindow[];
  ping?: number;
  pingSpace?: number;
}) => (
  <Desktop space={space} frame={frame} app={windows.at(-1)?.title ?? "Finder"} clock={clock} ping={ping} pingSpace={pingSpace}>
    {windows.map((w, i) => (
      <AppWindow key={w.id} kind={w.kind} {...w.rect} title={w.title} lines={w.lines} frame={frame} focused={i === windows.length - 1} />
    ))}
  </Desktop>
);
