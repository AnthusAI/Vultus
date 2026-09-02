import { buildRoundedRectPath } from "./avatarMath";
import { defineProceduralAvatarModel } from "./avatarModels";
import { BOT_AVATAR_STATES } from "./avatarStates";
import type { FacialShapeDefinition } from "./avatarStates";
import type { BotAvatarState } from "./avatarStates";

/**
 * The Chatticus wordmark's logo bubbles. Coordinates are CSS px at the
 * mark's native 28px size (viewBox is [0,0,28,28], so 1 user unit = 1px
 * there); the corner radii are the *clamped* values the browser actually
 * renders for the original CSS mark
 * (`rounded-[0.65rem_0.65rem_0.65rem_0.15rem]` etc. on a 20x16 box), not
 * the nominal 0.65rem/0.15rem figures — the box's radii sum to more than
 * its own height, so CSS scales all four down by 16/20.8 ≈ 0.7692 before
 * rendering them. Using the nominal values here would visibly diverge
 * from the mark as it renders today.
 */
const INK_BUBBLE_PATH = buildRoundedRectPath(0, 4, 20, 16, {
  topLeft: 8,
  topRight: 8,
  bottomRight: 8,
  bottomLeft: 1.85
});

const CLAY_BUBBLE_PATH = buildRoundedRectPath(8, 8, 20, 16, {
  topLeft: 8,
  topRight: 8,
  bottomRight: 1.85,
  bottomLeft: 8
});

/**
 * The mark has no facial expression repertoire — it's a logo, not a
 * character with states — so every BotAvatarState maps to the same
 * resting dot. Chatticus's usage never transitions state; this exists so
 * the model satisfies ProceduralAvatarModel's Record<BotAvatarState, ...>
 * requirement and renders sanely if a future caller ever does pass a
 * different state.
 */
const restingEyeShape: FacialShapeDefinition = { rx: 2, ry: 2, dy: 0, shape: "ellipse" };
const chatticusEyeShapesByState: Record<BotAvatarState, FacialShapeDefinition> = Object.fromEntries(
  BOT_AVATAR_STATES.map((state) => [state, restingEyeShape])
) as Record<BotAvatarState, FacialShapeDefinition>;

/**
 * The Chatticus wordmark logo, as a Vultus procedural model. Colorway is
 * driven entirely by the standard shadowColor/lightColor/accentColor
 * props: the ink bubble is "shadow", the clay bubble is "accent", and the
 * eyes are "light" — so the existing not-inverse/inverse swap Wordmark
 * already does (ink+clay+paper vs. paper+signal+ink) is just choosing
 * which three colors to pass in, no model-level branching needed.
 *
 * Gaze travel is deliberately modest and roughly symmetric: the eyes sit
 * well inside the ink+clay silhouette in every direction (the shapes are
 * large, 20x16 user units, relative to a 2px-radius eye near their
 * center), so there's no tight corner to hug the way a naive "how close
 * is the nearest bubble edge" analysis suggests — the eyes never need to
 * stay on any *one* bubble, only inside the combined silhouette. These
 * values are a safe starting budget, meant to be fine-tuned visually once
 * wired into the page (see the Chatticus-side verification steps).
 */
export const CHATTICUS_MARK_MODEL = defineProceduralAvatarModel({
  id: "chatticus-mark",
  name: "Chatticus Mark",
  viewBox: [0, 0, 28, 28],
  body: [
    { kind: "path", d: INK_BUBBLE_PATH, fillRole: "shadow" },
    { kind: "path", d: CLAY_BUBBLE_PATH, fillRole: "accent" }
  ],
  features: {
    leftEye: { cx: 10, cy: 14, fillRole: "light" },
    rightEye: { cx: 18, cy: 14, fillRole: "light" }
  },
  eyeShapesByState: chatticusEyeShapesByState,
  blink: { closedRx: 2, closedRy: 0.3 },
  gaze: { travel: { left: 1.4, right: 1.4, up: 1.1, down: 1.1 } }
});
