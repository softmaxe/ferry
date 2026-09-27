import { Composition } from "remotion";
import { Film } from "./Film";
import { Paper } from "./handdrawn/Paper";
import { Film as HanddrawnFilm } from "./handdrawn/Film";
import { FPS as HAND_FPS, TOTAL_FRAMES as HAND_FRAMES } from "./handdrawn/timeline";
import "./theme";
import { FPS, TOTAL_FRAMES } from "./timeline";

export const Root = () => (
  <>
    <Composition id="ferry-paper" component={Paper} durationInFrames={1} fps={HAND_FPS} width={1920} height={1080} />
    <Composition id="ferry-handdrawn-en" component={HanddrawnFilm} defaultProps={{ lang: "en" as const }} durationInFrames={HAND_FRAMES} fps={HAND_FPS} width={1920} height={1080} />
    <Composition id="ferry-handdrawn-zh" component={HanddrawnFilm} defaultProps={{ lang: "zh" as const }} durationInFrames={HAND_FRAMES} fps={HAND_FPS} width={1920} height={1080} />
    <Composition id="ferry-en" component={Film} defaultProps={{ lang: "en" as const }} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="ferry-zh" component={Film} defaultProps={{ lang: "zh" as const }} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1920} height={1080} />
  </>
);
