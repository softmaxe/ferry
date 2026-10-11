import type { ReactNode } from "react";
import type { Rect } from "../anim";

/** SVG transform that shows viewport `v` across the full 1920×1080 frame. */
const cameraTransform = (v: Rect) => {
  const s = 1920 / v.w;
  return `scale(${s}) translate(${-v.x} ${-v.y})`;
};

/** A 1920×1080 frame showing `view` of the world drawn in `children`, plus unscaled overlays. */
export const Shot = ({ view, children, overlay }: { view: Rect; children: ReactNode; overlay?: ReactNode }) => (
  <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
    <g transform={cameraTransform(view)}>{children}</g>
    {overlay}
  </svg>
);
