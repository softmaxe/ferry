import { spring } from "remotion";
import { lerp, ramp } from "../anim";
import { Ferri } from "../components/Ferri";
import { Cursor, Mac, MacScreen, SpaceStrip, thumbCenter } from "../components/Mac";
import { RedPenCircle } from "../components/RedPen";
import { WindowFrame } from "../components/WindowFrame";
import { RoughDrawing } from "../rough";
import { C, FONT } from "../theme";
import { cueFrame, eighths, FPS } from "../timeline";
import type { BeatProps } from "./types";

const MAC_BOX = { x: 592, y: 130, w: 1188, h: 690 };
const DOCS = { w: 1030, h: 690 };
const DOCS_HOME = { x: 1265, y: 588 };
const DOCS_MC = { x: 1390, y: 666, scale: 0.64 };
const CHAT = { w: 950, h: 600 };
const smooth = (value: number) => value * value * (3 - 2 * value);

/** The docs window misses Space 2 and springs back into Mission Control. */
export const B1 = ({ frame, beat, lang, text }: BeatProps) => {
  const focus = smooth(ramp(frame, cueFrame("b1.focus"), cueFrame("b1.focus") + eighths(1)));
  const mc = smooth(ramp(frame, cueFrame("b1.missionControl"), cueFrame("b1.missionControl") + eighths(2)));
  const grab = cueFrame("b1.grab");
  const slip = cueFrame("b1.slip");
  const drop = cueFrame("b1.drop");
  const mark = cueFrame("b1.mark");
  const drag = smooth(ramp(frame, grab, slip));
  const target = thumbCenter(2);
  const wobble = frame >= grab && frame < slip ? Math.sin((frame - grab) / 4) * drag * 14 : 0;
  const reach = { x: target.x + 32, y: target.y + 74 };
  const dragged = {
    x: lerp(DOCS_MC.x, reach.x, drag) + wobble,
    y: lerp(DOCS_MC.y, reach.y, drag) - Math.sin(drag * Math.PI) * 34,
    scale: lerp(DOCS_MC.scale, 0.31, drag),
  };
  const back = frame < slip ? 0 : spring({ frame: frame - slip, fps: FPS, durationInFrames: drop - slip, config: { damping: 12, stiffness: 130, mass: 0.75 } });
  const at = frame >= slip ? {
    x: lerp(reach.x, DOCS_MC.x, back), y: lerp(reach.y, DOCS_MC.y, back), scale: lerp(0.31, DOCS_MC.scale, back),
  } : frame >= grab ? dragged : DOCS_MC;
  const docsX = lerp(DOCS_HOME.x, at.x, mc);
  const docsY = lerp(DOCS_HOME.y, at.y, mc);
  const docsScale = lerp(1, at.scale, mc) * (0.91 + focus * 0.09);
  const spin = frame >= slip && frame < drop ? Math.sin((frame - slip) / (drop - slip) * Math.PI * 3) * 9 * (1 - (frame - slip) / (drop - slip)) : wobble * 0.18;
  const cursor = frame >= slip ? { x: reach.x + 60, y: reach.y - DOCS.h * 0.31 / 2 + 14 } : {
    x: docsX + DOCS.w * docsScale * 0.11,
    y: docsY - DOCS.h * docsScale / 2 + 30 * docsScale,
  };

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <Cafe frame={frame} />
      <Mac box={MAC_BOX} frame={frame}>
        <MacScreen space={1} app={focus > 0.5 ? text.windows.docs : text.windows.chat} clock={beat.clock} frame={frame} showDock={mc < 0.5}>
          {mc > 0 && <rect width={1920} height={1080} fill={C.navy} opacity={0.055 * mc} />}
          <WindowFrame x={lerp(570, 510, mc) - CHAT.w / 2} y={lerp(640, 668, mc) - CHAT.h / 2} {...CHAT} scale={lerp(1, 0.66, mc)} kind="chat" title={text.windows.chat} lang={lang} frame={frame} focused={focus < 0.5} seed={210} />
          <SpaceStrip progress={mc} frame={frame} highlightSpace={2} highlight={frame >= grab && frame < slip ? drag : 0} />
          {focus > 0 && <WindowFrame x={docsX - DOCS.w / 2} y={docsY - DOCS.h / 2} {...DOCS} kind="docs" title={text.windows.docs} lang={lang} frame={frame} scale={docsScale} rotate={spin} opacity={focus} seed={220} />}
          {mc > 0.1 && <Cursor {...cursor} grab={frame >= grab && frame < slip} scale={1.7} />}
          {frame >= mark && <RedPenCircle cx={DOCS_MC.x} cy={DOCS_MC.y} rx={390} ry={268} progress={ramp(frame, mark, mark + eighths(2))} note="?!" noteX={1712} noteY={392} noteSize={100} noteProgress={ramp(frame, mark + eighths(1), mark + eighths(3))} strokeWidth={8} />}
        </MacScreen>
      </Mac>
      <Ferri x={382} y={888} scale={1.3} pose={frame >= drop ? "scratch" : "typing"} frame={frame} fps={FPS} look={frame >= drop ? [0.8, -0.4] : [0.9, -0.1]} />
      <text x={121} y={547} fontFamily={FONT.hand} fontSize={30} fill={C.pencil}>{beat.clock}</text>
    </svg>
  );
};

const Cafe = ({ frame }: { frame: number }) => (
  <g>
    <rect x={122} y={133} width={326} height={339} fill={C.sunsetGold} opacity={0.08} />
    <circle cx={365} cy={218} r={52} fill={C.sunsetGold} opacity={0.11} />
    <RoughDrawing seed={710} options={{ stroke: C.pencil, strokeWidth: 2.4, roughness: 1.1, bowing: 0.7 }} build={(g, o) => [
      g.rectangle(122, 133, 326, 339, o), g.line(285, 133, 285, 472, o), g.line(122, 302, 448, 302, o),
      g.line(105, 487, 463, 487, o), g.line(122, 493, 449, 493, o),
      g.line(89, 894, 1842, 894, o), g.line(113, 909, 1818, 909, o),
      g.line(186, 910, 176, 925, o), g.line(1738, 910, 1744, 925, o),
    ]} />
    <RoughDrawing seed={720} options={{ stroke: C.graphite, strokeWidth: 2.8, roughness: 0.9, fill: C.whitePaper, fillStyle: "solid" }} build={(g, o) => [
      g.ellipse(157, 877, 108, 13, o), g.rectangle(124, 803, 69, 66, o), g.ellipse(158, 803, 69, 16, o),
      g.curve([[194, 815], [218, 815], [223, 836], [211, 851], [194, 850]], { ...o, fill: undefined }),
    ]} />
    <g opacity={0.27 + Math.sin(frame / 75) * 0.05}>
      <RoughDrawing seed={721} options={{ stroke: C.pencil, strokeWidth: 2.2, roughness: 0.8 }} build={(g, o) => [g.curve([[147, 790], [141, 777], [151, 760], [147, 747]], o), g.curve([[170, 791], [179, 778], [169, 761], [174, 745]], o)]} />
    </g>
  </g>
);
