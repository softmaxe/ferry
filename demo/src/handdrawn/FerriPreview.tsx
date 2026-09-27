import { Composition, registerRoot } from "remotion";
import { FerriSheet } from "./components/FerriSheet";

// Render independently while the film's scenes are still being assembled.
const FerriPreview = () => <Composition id="ferri-preview" component={FerriSheet} durationInFrames={240} fps={60} width={1920} height={1080} />;

registerRoot(FerriPreview);
