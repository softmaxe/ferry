import { FULL, bob, cuePop, cueProgress, ease, keys, lerp, viewportBetween } from "../anim";
import { AppWindow } from "../components/AppWindow";
import { Character } from "../components/Character";
import { Cursor, Desktop } from "../components/Desktop";
import { SpaceStrip, thumbCenter } from "../components/MissionControl";
import { Caption, ClockChip } from "../components/Overlays";
import { Room, SCREEN } from "../components/Room";
import { Shot } from "../components/Shot";
import { C, FONT } from "../theme";
import { cueFrame, eighths } from "../timeline";
import { HOME, LANDING, SIZE } from "../layouts";
import type { SceneProps } from "./types";

// Cold open: the docs window opened on the chat Space; dragging it in Mission Control goes wrong.

const CLOSE = { x: 360, y: 210, w: 1200, h: 675 };
const CHAT = HOME[1][0];
const DOCS = { ...LANDING[1], ...SIZE.docs };

export const P1 = ({ frame: f, text }: SceneProps) => {
  const zoomIn = cueProgress(f, "p1.zoomIn", 3, ease.inOut);
  const zoomOut = cueProgress(f, "p1.zoomOut", 2, ease.out);
  const drift = keys(f, [[0, 0], [cueFrame("p1.zoomIn"), 1]], ease.soft);
  const roomView = viewportBetween(FULL, { x: 60, y: 34, w: 1800, h: 1012.5 }, drift);
  const view = f < cueFrame("p1.zoomOut") ? viewportBetween(roomView, SCREEN, zoomIn) : viewportBetween(SCREEN, CLOSE, zoomOut);

  // --- screen ---
  const docsIn = cuePop(f, "p1.docsPop", 0, 13);
  const mc = cueProgress(f, "p1.missionControl", 2, ease.out);
  const grab = cueFrame("p1.grab");
  const slip = cueFrame("p1.slip");

  // Mission Control layout: both windows shrink side by side.
  const chatMc = { x: 560, y: 610, s: 0.5 };
  const docsMc = { x: 1360, y: 610, s: 0.5 };
  const target = thumbCenter(2);

  // Drag path: wobble toward Space 2, then the window slips and springs back.
  const dragT = keys(f, [[grab, 0], [slip, 1]], ease.soft);
  const wobble = Math.sin((f - grab) / 3.2) * 18 * (f > grab && f < slip ? 1 : 0);
  const dragPos = {
    x: lerp(docsMc.x, target.x + 30, dragT) + wobble,
    y: lerp(docsMc.y, target.y + 70, dragT) - Math.sin(dragT * Math.PI) * 60,
  };
  const back = cuePop(f, "p1.slip", 0.5, 9);
  const slipped = f >= slip;
  const docsPos = slipped
    ? { x: lerp(dragPos.x, docsMc.x, back), y: lerp(target.y + 70, docsMc.y, back) + (1 - back) * -40 }
    : f >= grab
      ? dragPos
      : docsMc;
  const docsScale = slipped ? lerp(0.26, docsMc.s, back) : f >= grab ? lerp(docsMc.s, 0.26, Math.min(1, dragT * 1.6)) : docsMc.s;
  const spin = slipped ? Math.sin(back * Math.PI * 3) * 12 * (1 - back) : wobble * 0.15;

  const cursorAt = slipped
    ? { x: target.x + 30 + (f - slip) * 0.6, y: target.y + 70 }
    : f >= grab
      ? dragPos
      : { x: lerp(1600, docsMc.x, mc), y: lerp(900, docsMc.y + 20, mc) };

  const winAt = (
    base: { x: number; y: number; w: number; h: number },
    mcPos: { x: number; y: number; s: number },
    pos: { x: number; y: number } = mcPos,
    s = mcPos.s,
  ) => {
    const cx = lerp(base.x + base.w / 2, pos.x, mc);
    const cy = lerp(base.y + base.h / 2, pos.y, mc);
    return { x: cx - base.w / 2, y: cy - base.h / 2, s: lerp(1, s, mc) };
  };
  const chatAt = winAt(CHAT, chatMc);
  const docsAt = winAt(DOCS, docsMc, docsPos, docsScale);

  const oops = cuePop(f, "p1.drop", 0, 8);

  const screen = (
    <Desktop space={1} frame={f} app={text.windows.chat} clock="08:30">
      {mc > 0 && <rect width={1920} height={1080} fill={C.navyInk} opacity={0.55 * mc} />}
      <AppWindow {...CHAT} x={chatAt.x} y={chatAt.y} scale={chatAt.s} title={text.windows.chat} frame={f} focused={docsIn < 0.5} />
      {docsIn > 0 && (
        <AppWindow
          kind="docs"
          {...DOCS}
          x={docsAt.x}
          y={docsAt.y}
          scale={docsAt.s * (0.85 + 0.15 * docsIn)}
          rotate={spin}
          opacity={Math.min(1, docsIn * 1.5)}
          title={text.windows.docs}
          frame={f}
        />
      )}
      <SpaceStrip show={mc} frame={f} highlight={f >= grab && !slipped ? dragT : 0} highlightSpace={2} />
      {mc > 0.2 && <Cursor x={cursorAt.x} y={cursorAt.y} grab={f >= grab && !slipped} />}
      {oops > 0 && (
        <g transform={`translate(${docsMc.x + 170} ${docsMc.y - 190}) scale(${oops})`}>
          <circle r={62} fill={C.coral} />
          <text y={22} textAnchor="middle" fontFamily={FONT.display} fontWeight={700} fontSize={64} fill={C.cream}>
            ?!
          </text>
        </g>
      )}
    </Desktop>
  );

  // --- character ---
  const sipping = f < cueFrame("p1.zoomIn") + eighths(1);
  const sip = keys(f, [[0, 1], [40, 1], [70, 0.2]], ease.soft);
  const sigh = cueProgress(f, "p1.sigh", 2, ease.inOut);
  const type = Math.sin(f / 2.2) * 5;
  const b = bob(f, 3, 160);

  return (
    <Shot
      view={view}
      overlay={
        <>
          <ClockChip time="08:30" show={1 - zoomIn + zoomOut} />
          <Caption text={text.p1Caption} show={cueProgress(f, "p1.sigh", 2, ease.out, 1)} y={960} />
        </>
      }
    >
      <Room kind="cafe" frame={f} screen={screen} cupOnDesk={!sipping}>
        <Character
          x={700}
          y={800 + b.y * 0.3}
          front={sipping ? { x: lerp(170, 70, sip), y: lerp(-92, -196, sip) } : { x: 176, y: -92 + type * (1 - sigh) }}
          back={{ x: 160, y: -98 - type * (1 - sigh) }}
          holding={sipping ? "cup" : null}
          lean={sigh * 8}
          nod={sigh * 9}
          mouth={sigh > 0.2 ? "sigh" : sip > 0.6 ? "o" : "neutral"}
          blink={sigh > 0.3 ? 1 : f % 150 < 6 ? 1 : 0}
          sweat={sigh}
        />
      </Room>
    </Shot>
  );
};
