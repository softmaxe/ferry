import { Audio } from "@remotion/media";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { Caption } from "./Caption";
import { copy, type Lang } from "./copy";
import { loadFonts } from "./fonts";
import { Paper } from "./Paper";
import { Placeholder } from "./beats/Placeholder";
import type { BeatProps } from "./beats/types";
import { beatAt, type BeatId } from "./timeline";
loadFonts();
const SCENES: Record<BeatId, (props: BeatProps) => React.ReactNode> = {
  B1: Placeholder, B2: Placeholder, B3: Placeholder,
  B4: Placeholder, B5: Placeholder, B6: Placeholder,
};
export const Film = ({ lang }: { lang: Lang }) => {
  const frame = useCurrentFrame();
  const beat = beatAt(frame);
  const Scene = SCENES[beat.id];
  return (
    <AbsoluteFill>
      <Paper />
      <Scene frame={frame} beat={beat} lang={lang} text={copy[lang]} />
      <Caption frame={frame} lang={lang} />
      <Audio src={staticFile("handdrawn.wav")} />
    </AbsoluteFill>
  );
};
