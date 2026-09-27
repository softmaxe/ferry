import type { Copy, Lang } from "../copy";
import type { Beat } from "../timeline";
/** Every scene receives the absolute film frame, including in standalone previews. */
export type BeatProps = { frame: number; beat: Beat; lang: Lang; text: Copy };
