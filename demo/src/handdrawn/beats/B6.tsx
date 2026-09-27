import { useId } from "react";
import { lerp, pencilSeed, ramp } from "../anim";
import { Boat, Wake } from "../components/Boat";
import { Ferri } from "../components/Ferri";
import { Mac, MacScreen } from "../components/Mac";
import { WindowFrame } from "../components/WindowFrame";
import { RoughDrawing } from "../rough";
import { C, FONT } from "../theme";
import { cueFrame, eighths, FPS } from "../timeline";
import type { BeatProps } from "./types";

const HORIZON = 532;
const MAC = { x: 586, y: 258, w: 600, h: 384 };
const smooth = (value: number) => value * value * (3 - 2 * value);

/** The laptop closes, Ferri waves, and the empty boat leaves the harbor. */
export const B6 = ({ frame, beat, lang, text }: BeatProps) => {
  const id = `close-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const closeAt = cueFrame("b6.closeLid");
  const sailAt = cueFrame("b6.sail");
  const installAt = cueFrame("b6.install");
  const linkAt = cueFrame("b6.link");
  const resolveAt = cueFrame("b6.resolve");
  const lid = 1 - smooth(ramp(frame, closeAt, sailAt));
  const card = smooth(ramp(frame, sailAt, installAt));
  const sail = smooth(ramp(frame, sailAt, resolveAt));
  const install = ramp(frame, installAt, installAt + eighths(2));
  const link = ramp(frame, linkAt, linkAt + eighths(2));
  const boatX = lerp(1370, 2200, sail);
  const boatScale = lerp(0.35, 0.24, sail);
  const commandWidth = text.installCommand.length * 26.5;
  const commandLeft = (1920 - commandWidth) / 2;
  const lineSeed = pencilSeed(860, frame);

  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <clipPath id={`${id}-sun`}><rect x={0} y={0} width={1920} height={HORIZON} /></clipPath>
        <clipPath id={`${id}-command`}><rect x={commandLeft - 10} y={678} width={(commandWidth + 20) * install} height={66} /></clipPath>
        <clipPath id={`${id}-link`}><rect x={520} y={790} width={880 * link} height={66} /></clipPath>
      </defs>

      <g clipPath={`url(#${id}-sun)`}>
        <circle cx={1512} cy={lerp(470, 574, ramp(frame, cueFrame("b6.home"), resolveAt))} r={155} fill={C.sunsetGold} opacity={0.17} />
        <RoughDrawing
          seed={lineSeed} deps={[frame]}
          options={{ stroke: C.coralDeep, strokeWidth: 2.7, roughness: 1.1 }}
          build={(g, o) => [g.circle(1512, lerp(470, 574, ramp(frame, cueFrame("b6.home"), resolveAt)), 310, o)]}
        />
      </g>
      <RoughDrawing
        seed={lineSeed + 1} deps={[card]}
        options={{ stroke: C.sea, strokeWidth: 2.4, roughness: 1 }}
        build={(g, o) => [
          g.curve([[lerp(1212, 210, card), HORIZON], [1440, HORIZON - 4], [1730, HORIZON + 2], [1810, HORIZON]], o),
          g.line(1310, HORIZON + 28, 1480, HORIZON + 26, o),
          g.line(1586, HORIZON + 48, 1750, HORIZON + 50, o),
        ]}
      />
      <Wake x={boatX - boatScale * 430} y={HORIZON + 6} length={230} frame={frame} opacity={sail > 0 && sail < 1 ? Math.sin(sail * Math.PI) * 0.55 : 0} />
      <Boat x={boatX} y={HORIZON + Math.sin(frame / 32) * 2} frame={frame} scale={boatScale} rotate={Math.sin(frame / 49) * 0.4} speed={0.65 * sail} />

      <g opacity={1 - card}>
        <RoughDrawing seed={lineSeed + 2} options={{ stroke: C.pencil, strokeWidth: 2.4, roughness: 1.1 }} build={(g, o) => [
          g.line(192, 718, 1218, 718, o), g.line(217, 734, 1190, 734, o),
          g.line(268, 734, 262, 822, o), g.line(1130, 734, 1137, 822, o),
        ]} />
        <Mac box={MAC} frame={frame} lid={lid}>
          <MacScreen space={5} app={text.windows.call} clock={beat.clock} frame={frame}>
            <WindowFrame x={476} y={206} w={982} h={684} title={text.windows.call} kind="call" lang={lang} frame={frame} />
          </MacScreen>
        </Mac>
        <Ferri x={413} y={708} scale={1.15} pose={frame < closeAt ? "pleased" : "wave"} eyes="happy" frame={frame} fps={FPS} look={frame < closeAt ? [0.8, 0] : [0, 0]} />
        <text x={245} y={305} fontFamily={FONT.hand} fontSize={31} fill={C.pencil}>{beat.clock}</text>
      </g>

      <text x={960} y={316} fontFamily={FONT.hand} fontSize={144} textAnchor="middle" fill={C.navy} opacity={card}>ferry</text>
      <g clipPath={`url(#${id}-command)`}>
        <text x={commandLeft} y={730} fontFamily={FONT.mono} fontSize={44} fill={C.navyInk}>{text.installCommand}</text>
      </g>
      <g clipPath={`url(#${id}-link)`}>
        <text x={960} y={840} fontFamily={FONT.hand} fontSize={50} textAnchor="middle" fill={C.ink}>{text.repoLink}</text>
      </g>
      <text x={960} y={901} fontFamily={FONT.ui} fontSize={25} textAnchor="middle" fill={C.pencil} opacity={link}>{text.endLine}</text>
    </svg>
  );
};
