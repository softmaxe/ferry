import { AbsoluteFill, Composition, registerRoot, useCurrentFrame } from "remotion";
import { B4 } from "./beats/B4";
import { Caption } from "./Caption";
import { copy, type Lang } from "./copy";
import { loadFonts } from "./fonts";
import { Paper } from "./Paper";
import { beatById, beatEndFrame, beatStartFrame, FPS } from "./timeline";

loadFonts();
const beat = beatById("B4");
const Hotkeys = ({ lang }: { lang: Lang }) => {
  const frame = useCurrentFrame() + beatStartFrame(beat);
  return <AbsoluteFill><Paper /><B4 frame={frame} beat={beat} lang={lang} text={copy[lang]} /><Caption frame={frame} lang={lang} /></AbsoluteFill>;
};
registerRoot(() => <>{(["en", "zh"] as const).map((lang) => <Composition key={lang} id={`hotkeys-${lang}`} component={Hotkeys} defaultProps={{ lang }} durationInFrames={beatEndFrame(beat) - beatStartFrame(beat)} fps={FPS} width={1920} height={1080} />)}</>);
