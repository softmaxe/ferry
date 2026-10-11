import { Audio } from "@remotion/media";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { WaveWipe } from "./components/Overlays";
import { copy, type Lang } from "./copy";
import { P1 } from "./scenes/P1";
import { P2 } from "./scenes/P2";
import { P3 } from "./scenes/P3";
import { P4 } from "./scenes/P4";
import { P5 } from "./scenes/P5";
import { P6 } from "./scenes/P6";
import { P7 } from "./scenes/P7";
import type { SceneProps } from "./scenes/types";
import { C } from "./theme";
import { eighths, positionFrame, sceneAt, type SceneId } from "./timeline";

const SCENES: Record<SceneId, (props: SceneProps) => React.ReactNode> = { P1, P2, P3, P4, P5, P6, P7 };

// A wave carries the film across each change of place and time; the cut happens under it,
// exactly on the downbeat.
const WIPES = [5, 13, 21].map((bar) => positionFrame(bar));
const WIPE_HALF = eighths(1.2);

export const Film = ({ lang }: { lang: Lang }) => {
  const frame = useCurrentFrame();
  const Scene = SCENES[sceneAt(frame).id];
  const wipe = WIPES.find((at) => Math.abs(frame - at) < WIPE_HALF);
  return (
    <AbsoluteFill style={{ backgroundColor: C.cream }}>
      <Scene frame={frame} text={copy[lang]} />
      {wipe !== undefined && (
        <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
          <WaveWipe t={(frame - wipe + WIPE_HALF) / (2 * WIPE_HALF)} frame={frame} />
        </svg>
      )}
      <Audio src={staticFile("music.wav")} />
    </AbsoluteFill>
  );
};
