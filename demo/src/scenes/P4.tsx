import { FULL, cuePop, cueProgress, ease, viewportBetween } from "../anim";
import { Character } from "../components/Character";
import { Caption, ClockChip, Keycaps } from "../components/Overlays";
import { RaycastSettings, hotkeyLabel } from "../components/Raycast";
import { Room, SCREEN } from "../components/Room";
import { Shot } from "../components/Shot";
import { SpaceView } from "../components/SpaceView";
import { LANDING, SIZE } from "../layouts";
import { FRAMES_PER_EIGHTH, cueFrame, eighths } from "../timeline";
import { residentCast, type PlacedWindow } from "../trip";
import type { SceneProps } from "./types";

// Afternoon at the office: each Ferry command gets a hotkey in Raycast's settings.

const P4_CLOCK = "14:00";
export const DESIGN_ON_2 = { x: 780, y: 230, ...SIZE.design };

export const P4 = ({ frame: f, text }: SceneProps) => {
  const zoom = cueProgress(f, "p4.zoomIn", 2, ease.inOut);
  const view = viewportBetween(FULL, SCREEN, zoom);

  const open = cuePop(f, "p4.settings", 0, 15) * (1 - cueProgress(f, "p4.close", 1, ease.in));
  const records = [1, 2, 3, 4, 5].map((i) => cueFrame(`p4.record${i}`));
  const recorded = records.map((r) => (f < r ? 0 : Math.min(1, (f - r) / eighths(1))));
  const recording = records.findIndex((r) => f >= r - eighths(1.5) && f < r + eighths(0.5));
  const current = records.findIndex((r) => f >= r - eighths(0.4) && f < r + eighths(1.4));
  const press = current < 0 ? 0 : Math.max(0, Math.sin(((f - records[current]) / FRAMES_PER_EIGHTH) * Math.PI));
  const keysShow = current < 0 ? 0 : Math.min(1, (f - (records[current] - eighths(0.4))) / 6) * Math.min(1, (records[current] + eighths(1.4) - f) / 6);

  // A design review pops up on Space 2 just before the montage that sends it away.
  const designPop = cuePop(f, "p4.close", 1, 13);
  const windows: PlacedWindow[] = [
    ...residentCast(text).filter((w) => w.space === 2),
    { id: "docs", kind: "docs", title: text.windows.docs, rect: { ...LANDING[2], ...SIZE.docs } },
  ];
  if (designPop > 0) windows.push({ id: "design", kind: "design", title: text.windows.design, rect: DESIGN_ON_2 });

  const screen = (
    <g>
      <SpaceView space={2} frame={f} clock={P4_CLOCK} windows={windows} />
      <RaycastSettings open={open} recorded={recorded} recording={recording} />
    </g>
  );

  const type = Math.sin(f / 2.3) * 5;
  return (
    <Shot
      view={view}
      overlay={
        <>
          <ClockChip time={P4_CLOCK} show={1 - zoom} />
          <Caption text={text.p4Caption} show={cueProgress(f, "p4.settings", 2, ease.out, 1) * (1 - cueProgress(f, "p4.close", 1, ease.in))} />
          {current >= 0 && <Keycaps keys={hotkeyLabel(current + 1)} appear={keysShow} press={press} x={1700} y={965} size={84} />}
        </>
      }
    >
      <Room kind="office" frame={f} screen={screen}>
        <Character x={700} y={800} front={{ x: 176, y: -92 + type }} back={{ x: 160, y: -98 - type }} mouth="smile" blink={f % 170 < 6 ? 1 : 0} />
      </Room>
    </Shot>
  );
};
