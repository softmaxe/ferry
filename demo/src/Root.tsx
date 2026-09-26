import { Composition } from "remotion";
import { Film } from "./Film";
import "./theme";
import { FPS, TOTAL_FRAMES } from "./timeline";

export const Root = () => (
  <>
    <Composition id="ferry-en" component={Film} defaultProps={{ lang: "en" as const }} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="ferry-zh" component={Film} defaultProps={{ lang: "zh" as const }} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1920} height={1080} />
  </>
);
