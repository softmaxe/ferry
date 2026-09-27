import { Composition } from "remotion";
import { Film } from "./handdrawn/Film";
import { Paper } from "./handdrawn/Paper";
import { FerriSheet } from "./handdrawn/components/FerriSheet";
import { FPS, TOTAL_FRAMES } from "./handdrawn/timeline";

export const Root = () => (
  <>
    <Composition id="ferry-paper" component={Paper} durationInFrames={1} fps={FPS} width={1920} height={1080} />
    <Composition id="ferri-preview" component={FerriSheet} durationInFrames={240} fps={FPS} width={1920} height={1080} />
    <Composition id="ferry-en" component={Film} defaultProps={{ lang: "en" as const }} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="ferry-zh" component={Film} defaultProps={{ lang: "zh" as const }} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1920} height={1080} />
  </>
);
