import { FULL, cuePop, cueProgress, ease, viewportBetween } from "../anim";
import { Character } from "../components/Character";
import { Hop } from "../components/Hop";
import { Caption, ClockChip, Keycaps } from "../components/Overlays";
import { hotkeyLabel } from "../components/Raycast";
import { Room, SCREEN } from "../components/Room";
import { Shot } from "../components/Shot";
import { SpaceView, guestsOn } from "../components/SpaceView";
import type { Copy } from "../copy";
import { LANDING, SIZE } from "../layouts";
import { FRAMES_PER_EIGHTH, cueFrame, eighths, trip } from "../timeline";
import { residentCast, tripModel, type TripSpec } from "../trip";
import { DESIGN_ON_2 } from "./P4";
import type { SceneProps } from "./types";

// Hotkey montage: three windows, three keystrokes, the screen following each one.

const CLOCK = "14:05";
/** How long before each keystroke its keycaps appear. */
const KEYS_LEAD = eighths(0.5);

const TRIPS: TripSpec[] = [
  { cue: "p5.move1", window: "design", follow: true },
  { cue: "p5.move2", window: "dm", follow: true },
  { cue: "p5.move3", window: "music", follow: true },
];

/** The scene's cast and its three Follow Trips; DM and music pop in after the Trip before theirs. */
export const p5Trips = (text: Copy) =>
  tripModel({
    screen: trip("p5.move1").from,
    cast: [
      ...residentCast(text),
      { id: "docs", kind: "docs", title: text.windows.docs, space: 2, rect: { ...LANDING[2], ...SIZE.docs } },
      { id: "design", kind: "design", title: text.windows.design, space: 2, rect: DESIGN_ON_2 },
      { id: "dm", kind: "chat", title: text.windows.dm, space: 3, rect: { x: 300, y: 330, ...SIZE.chat }, appearsAt: cueFrame("p5.move1") + eighths(5) },
      { id: "music", kind: "music", title: text.windows.music, space: 1, rect: { x: 260, y: 420, ...SIZE.music }, appearsAt: cueFrame("p5.move2") + eighths(5) },
    ],
    trips: TRIPS,
  });

export const P5 = ({ frame: f, text }: SceneProps) => {
  const trips = p5Trips(text);
  const active = trips.activeTrip(f);
  const shown = trips.screenSpace(f);

  const zoomOut = cueProgress(f, "p5.zoomOut", 2, ease.inOut);
  const inRoom = f >= cueFrame("p5.zoomOut");

  const screen = active ? (
    <Hop frame={f} trips={trips} clock={CLOCK} />
  ) : (
    <SpaceView space={shown} frame={f} text={text} clock={CLOCK} guests={guestsOn(trips, shown, f)} />
  );

  // The keycaps show from half an eighth before each keystroke until the window has lifted: the
  // Trip active that lead later, while this frame is before the end of its lift.
  const ahead = trips.activeTrip(f + KEYS_LEAD);
  const keyed = ahead && f < ahead.phases.lift[1] ? ahead : undefined;
  const press = keyed ? Math.max(0, Math.sin(((f - keyed.at) / FRAMES_PER_EIGHTH) * Math.PI)) : 0;
  const keysShow = keyed ? Math.min(1, (f - (keyed.at - KEYS_LEAD)) / 6) * Math.min(1, (keyed.phases.lift[1] - f) / 6) : 0;

  const overlay = (
    <>
      <Caption text={text.p5Caption} show={cueProgress(f, "p5.move1", 2, ease.out, 1) * (1 - cueProgress(f, "p5.zoomOut", 1, ease.in, 4))} />
      {keyed && <Keycaps keys={hotkeyLabel(keyed.to)} appear={keysShow} press={press} x={1700} y={965} size={84} />}
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
