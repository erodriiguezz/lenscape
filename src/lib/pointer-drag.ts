/**
 * Suppresses accidental clicks immediately after a camera drag.
 *
 * The native `click` event fires on whatever element is under the pointer
 * at *pointerup* — it doesn't require pointerdown and pointerup to share a
 * target. Hotspot pins are plain DOM buttons floating over the canvas
 * (rendered via drei's `Html`), so rotating the camera and releasing the
 * mouse over a pin fires a real click on it, even though the user only
 * meant to orbit. Track drag distance globally and let click handlers ask
 * "was this release the end of a drag?" before acting on it.
 */

const DRAG_THRESHOLD_PX = 6;

let downX = 0;
let downY = 0;
let dragged = false;

export function trackPointerDown(x: number, y: number) {
  downX = x;
  downY = y;
  dragged = false;
}

export function trackPointerMove(x: number, y: number) {
  if (dragged) return;
  const dx = x - downX;
  const dy = y - downY;
  if (dx * dx + dy * dy > DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX) {
    dragged = true;
  }
}

/** Read-and-clear — call once from a click handler before acting on it. */
export function consumeWasDrag(): boolean {
  const was = dragged;
  dragged = false;
  return was;
}
