import { captionText, type Lang } from "./copy";
import { C, FONT } from "./theme";
import { captionAt } from "./timeline";
export const CAPTION_FONT_SIZE = 50;
export const CAPTION_WIDTH = 1680;
export const Caption = ({ frame, lang }: { frame: number; lang: Lang }) => {
  const caption = captionAt(frame);
  if (!caption) return null;
  return (
    <div style={{ position: "absolute", left: (1920 - CAPTION_WIDTH) / 2, width: CAPTION_WIDTH, top: 938, textAlign: "center", color: C.ink, fontFamily: FONT.hand, fontSize: CAPTION_FONT_SIZE, lineHeight: 1.25, whiteSpace: "nowrap" }}>
      {captionText(lang, caption.id)}
    </div>
  );
};
