import { FULL, bob, cueProgress, ease, viewportBetween } from "../anim";
import { Boat, Wake } from "../components/Boat";
import { Character } from "../components/Character";
import { ClockChip } from "../components/Overlays";
import { Room } from "../components/Room";
import { Shot } from "../components/Shot";
import { SpaceView } from "../components/SpaceView";
import { C, FONT } from "../theme";
import { Sea } from "./P2";
import type { SceneProps } from "./types";

// Sunset at home: the laptop closes, the camera drifts to the window, and the ferry sails
// into the end card.

const CLOCK = "19:30";
const WINDOW_VIEW = { x: 105, y: 170, w: 500, h: 281.25 };

export const P7 = ({ frame: f, text }: SceneProps) => {
  const lid = cueProgress(f, "p7.closeLid", 2, ease.inOut);
  const pan = cueProgress(f, "p7.pan", 5, ease.inOut);
  const card = cueProgress(f, "p7.endCard", 2, ease.inOut);
  const stretch = cueProgress(f, "p7.closeLid", 3, ease.inOut, 1.5);

  const room = (
    <Shot view={viewportBetween(FULL, WINDOW_VIEW, pan)} overlay={<ClockChip time={CLOCK} show={1 - pan} />}>
      <Room kind="sunset" frame={f} lid={lid} sail={cueProgress(f, "p7.home", 12, ease.soft)} screen={<SpaceView space={1} frame={f} text={text} clock={CLOCK} />}>
        <Character
          x={700}
          y={800}
          lean={stretch * 14}
          front={lid < 1 ? { x: 176 - lid * 20, y: -92 - lid * 30 } : { x: 60 + stretch * 10, y: -380 * stretch - 100 * (1 - stretch) }}
          back={lid < 1 ? { x: 160, y: -98 } : { x: 20, y: -370 * stretch - 100 * (1 - stretch) }}
          frontBendUp={lid >= 1}
          mouth={stretch > 0.3 ? "grin" : "smile"}
          blink={stretch > 0.4 ? 1 : f % 150 < 6 ? 1 : 0}
        />
      </Room>
    </Shot>
  );

  return (
    <>
      {card < 1 && room}
      {card > 0 && <EndCard frame={f} opacity={card} endLine={text.endLine} />}
    </>
  );
};

const EndCard = ({ frame: f, opacity, endLine }: { frame: number; opacity: number; endLine: string }) => {
  const b = bob(f, 6, 110);
  const arrive = cueProgress(f, "p7.endCard", 4, ease.out);
  const install = cueProgress(f, "p7.install", 2, ease.out);
  const link = cueProgress(f, "p7.final", 2, ease.out);
  const x = 960 - (1 - arrive) * 900;
  const horizon = 520;
  return (
    <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, opacity }}>
      <rect width={1920} height={1080} fill={C.cream} />
      <circle cx={960} cy={horizon} r={230} fill={C.coral} opacity={0.18} />
      <Sea frame={f} horizon={horizon} />
      <Wake x={x - 160} y={horizon - 4} length={320} frame={f} opacity={1 - arrive} />
      <Boat x={x} y={horizon + 30 + b.y} rotate={b.r} scale={0.5} speed={Math.max(0.35, 1 - arrive)} />
      <path
        d={`M -100 ${horizon + 10} ${Array.from({ length: 50 }, (_, i) => `L ${-100 + i * 45} ${horizon + 10 + Math.sin(i * 0.8 + f / 9) * 5}`).join(" ")} V 1200 H -100 Z`}
        fill={C.navy}
      />
      <Sea frame={f} horizon={horizon} fill={false} />
      <text x={960} y={230} textAnchor="middle" fontFamily={FONT.display} fontWeight={600} fontSize={150} fill={C.navy} letterSpacing={-3} opacity={arrive}>
        ferry
      </text>
      <g opacity={install} transform={`translate(0 ${(1 - install) * 20})`}>
        <rect x={960 - 470} y={640} width={940} height={96} rx={48} fill={C.cream} />
        <text x={960} y={703} textAnchor="middle" fontFamily={FONT.mono} fontWeight={600} fontSize={40} fill={C.navyInk}>
          <tspan fill={C.coral}>$ </tspan>brew install softmaxe/tap/ferry
        </text>
      </g>
      <g opacity={link}>
        <text x={960} y={830} textAnchor="middle" fontFamily={FONT.ui} fontWeight={600} fontSize={40} fill={C.cream}>
          github.com/softmaxe/ferry
        </text>
        <text x={960} y={895} textAnchor="middle" fontFamily={FONT.ui} fontWeight={500} fontSize={30} fill={C.cream} opacity={0.7}>
          {endLine}
        </text>
      </g>
    </svg>
  );
};
