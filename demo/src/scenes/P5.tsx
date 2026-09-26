import { FULL, cuePop, cueProgress, ease, viewportBetween } from "../anim";
import { Character } from "../components/Character";
import { Hop, type HopPlan } from "../components/Hop";
import { Caption, ClockChip, Keycaps } from "../components/Overlays";
import { hotkeyLabel } from "../components/Raycast";
import { Room, SCREEN } from "../components/Room";
import { Shot } from "../components/Shot";
import { SpaceView, type Guest } from "../components/SpaceView";
import type { Copy } from "../copy";
import { ARRIVAL, SIZE } from "../layouts";
import { FRAMES_PER_EIGHTH, cueFrame, eighths } from "../timeline";
import { DESIGN_ON_2 } from "./P4";
import type { SceneProps } from "./types";

// Hotkey montage: three windows, three keystrokes, the screen following each one.

const CLOCK = "14:05";
const HOP_LENGTH = eighths(5);

const plans = (text: Copy) => {
  const design: Guest = { kind: "design", title: text.windows.design, rect: DESIGN_ON_2 };
  const dm: Guest = { kind: "chat", title: text.windows.dm, rect: { x: 300, y: 330, ...SIZE.chat } };
  const music: Guest = { kind: "music", title: text.windows.music, rect: { x: 260, y: 420, ...SIZE.music } };
  const hops: (HopPlan & { popAt?: number })[] = [
    { at: cueFrame("p5.move1"), from: 2, to: 3, follow: true, window: design, landing: { ...ARRIVAL[3], ...SIZE.design } },
    { at: cueFrame("p5.move2"), from: 3, to: 1, follow: true, window: dm, landing: { ...ARRIVAL[1], ...SIZE.chat }, popAt: cueFrame("p5.move1") + eighths(5) },
    { at: cueFrame("p5.move3"), from: 1, to: 5, follow: true, window: music, landing: { ...ARRIVAL[5], ...SIZE.music }, popAt: cueFrame("p5.move2") + eighths(5) },
  ];
  return hops;
};

/** Windows on `space` at frame `f`, not counting one that is mid-hop. */
const guestsAt = (space: number, f: number, text: Copy, hops: ReturnType<typeof plans>): Guest[] => {
  const out: Guest[] = [];
  if (space === 2) out.push({ kind: "docs", title: text.windows.docs, rect: { ...ARRIVAL[2], ...SIZE.docs } });
  for (const hop of hops) {
    const appeared = hop.popAt === undefined || f >= hop.popAt;
    const departed = f >= hop.at + eighths(0.5);
    const arrived = f >= hop.at + eighths(4.5);
    if (space === hop.from && appeared && !departed) out.push(hop.window);
    if (space === hop.to && arrived) out.push({ ...hop.window, rect: hop.landing });
  }
  return out;
};

export const P5 = ({ frame: f, text }: SceneProps) => {
  const hops = plans(text);
  const active = hops.find((h) => f >= h.at && f < h.at + HOP_LENGTH);
  const settledSpace = [...hops].reverse().find((h) => f >= h.at + HOP_LENGTH)?.to ?? 2;

  const zoomOut = cueProgress(f, "p5.zoomOut", 2, ease.inOut);
  const inRoom = f >= cueFrame("p5.zoomOut");

  const screen = active ? (
    <Hop frame={f} plan={active} text={text} clock={CLOCK} guestsOf={(s) => guestsAt(s, f, text, hops)} />
  ) : (
    <SpaceView space={settledSpace} frame={f} text={text} clock={CLOCK} guests={guestsAt(settledSpace, f, text, hops)} />
  );

  const current = hops.findIndex((h) => f >= h.at - eighths(0.5) && f < h.at + eighths(1.5));
  const hop = hops[current];
  const press = hop ? Math.max(0, Math.sin(((f - hop.at) / FRAMES_PER_EIGHTH) * Math.PI)) : 0;
  const keysShow = hop ? Math.min(1, (f - (hop.at - eighths(0.5))) / 6) * Math.min(1, (hop.at + eighths(1.5) - f) / 6) : 0;

  const overlay = (
    <>
      <Caption text={text.p5Caption} show={cueProgress(f, "p5.move1", 2, ease.out, 1) * (1 - cueProgress(f, "p5.zoomOut", 1, ease.in, 4))} />
      {hop && <Keycaps keys={hotkeyLabel(hop.to)} appear={keysShow} press={press} x={1700} y={965} size={84} />}
      <ClockChip time={CLOCK} show={zoomOut} />
    </>
  );

  if (!inRoom) {
    return (
      <Shot view={FULL} overlay={overlay}>
        {screen}
      </Shot>
    );
  }

  const happy = cuePop(f, "p5.zoomOut", 1, 10);
  return (
    <Shot view={viewportBetween(SCREEN, FULL, zoomOut)} overlay={overlay}>
      <Room kind="office" frame={f} screen={screen}>
        <Character
          x={700}
          y={800}
          lean={happy * 10}
          front={{ x: 150 - happy * 30, y: -92 + happy * 20 }}
          back={{ x: 140 - happy * 30, y: -96 + happy * 20 }}
          mouth={happy > 0.4 ? "grin" : "smile"}
          blink={f % 170 < 6 ? 1 : 0}
        />
      </Room>
    </Shot>
  );
};
