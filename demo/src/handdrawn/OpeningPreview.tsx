import { AbsoluteFill, Composition, registerRoot, useCurrentFrame } from "remotion";
import { B1 } from "./beats/B1";
import { Caption } from "./Caption";
import { copy, type Lang } from "./copy";
import { loadFonts } from "./fonts";
import { Paper } from "./Paper";
import { beatById, beatEndFrame, FPS } from "./timeline";

loadFonts();
const beat = beatById("B1");
const Opening = ({ lang }: { lang: Lang }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill><Paper /><B1 frame={frame} beat={beat} lang={lang} text={copy[lang]} /><Caption frame={frame} lang={lang} /></AbsoluteFill>;
};
const OpeningPreview = () => <>{(["en", "zh"] as const).map((lang) => <Composition key={lang} id={`opening-${lang}`} component={Opening} defaultProps={{ lang }} durationInFrames={beatEndFrame(beat)} fps={FPS} width={1920} height={1080} />)}</>;
registerRoot(OpeningPreview);
