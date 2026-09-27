import { Audio } from "@remotion/media";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Caption } from "./Caption";
import { copy, type Lang } from "./copy";
import { DayWash, closingOpacity } from "./DayWash";
import { loadFonts } from "./fonts";
import { Paper } from "./Paper";
import { Placeholder } from "./beats/Placeholder";
import { B1 } from "./beats/B1";
import { B2 } from "./beats/B2";
import { B3 } from "./beats/B3";
import { B4 } from "./beats/B4";
import { B6 } from "./beats/B6";
import type { BeatProps } from "./beats/types";
import { beatAt, type BeatId } from "./timeline";
loadFonts();
const SCENES: Record<BeatId, (props: BeatProps) => React.ReactNode> = {
  B1, B2, B3,
  B4, B5: Placeholder, B6,
};
export const Film = ({ lang }: { lang: Lang }) => {
  const frame = useCurrentFrame();
  const beat = beatAt(frame);
  const Scene = SCENES[beat.id];
  return (
    <AbsoluteFill>
      <Paper />
      <AbsoluteFill style={{ opacity: closingOpacity(frame) }}>
        <DayWash frame={frame} />
        <Scene frame={frame} beat={beat} lang={lang} text={copy[lang]} />
        <Caption frame={frame} lang={lang} />
      </AbsoluteFill>
      <Audio src={staticFile("handdrawn.wav")} />
    </AbsoluteFill>
  );
};
