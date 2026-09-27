import { AbsoluteFill, Composition, registerRoot, useCurrentFrame } from "remotion";
import { B5 } from "./beats/B5";
import { Caption } from "./Caption";
import { copy, type Lang } from "./copy";
import { loadFonts } from "./fonts";
import { Paper } from "./Paper";
import { beatById, beatEndFrame, FPS } from "./timeline";

loadFonts();
const beat = beatById("B5");
const SendStay = ({ lang }: { lang: Lang }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill><Paper /><B5 frame={frame} beat={beat} lang={lang} text={copy[lang]} /><Caption frame={frame} lang={lang} /></AbsoluteFill>;
};
const Preview = () => <>{(["en", "zh"] as const).map((lang) => <Composition key={lang} id={`send-stay-${lang}`} component={SendStay} defaultProps={{ lang }} durationInFrames={beatEndFrame(beat)} fps={FPS} width={1920} height={1080} />)}</>;
registerRoot(Preview);
