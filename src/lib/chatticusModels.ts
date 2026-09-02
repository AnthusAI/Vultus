import { buildRoundedRectPath } from "./avatarMath";
import { defineProceduralAvatarModel } from "./avatarModels";
import { BOT_AVATAR_STATES } from "./avatarStates";
import type { FacialShapeDefinition } from "./avatarStates";
import type { BotAvatarState } from "./avatarStates";

/**
 * The Chatticus wordmark's logo bubbles. Coordinates are CSS px at the
 * mark's native 28px size (viewBox is [0,0,28,28], so 1 user unit = 1px
 * there); the corner radii are the *clamped* values a browser actually
 * renders for radii like `0.65rem 0.65rem 0.65rem 0.15rem` on a 20x16
 * box, not the nominal rem figures — the box's radii sum to more than its
 * own height, so CSS scales all four down by 16/20.8 ≈ 0.7692 before
 * rendering them.
 *
 * Mirrored left-to-right from the original CSS mark's layout (ink capped
 * on the right, clay capped on the left) so the mark's front-facing
 * (clay) bubble caps toward the left — matching the product's chat UI,
 * where the bot's messages sit on the left. The eye positions (10,14) and
 * (18,14) are unchanged: they're symmetric around the mark's center
 * (x=14), so mirroring just swaps two identical eyes onto each other.
 */
const INK_BUBBLE_PATH = buildRoundedRectPath(8, 4, 20, 16, {
  topLeft: 8,
  topRight: 8,
  bottomRight: 1.85,
  bottomLeft: 8
});

const CLAY_BUBBLE_PATH = buildRoundedRectPath(0, 8, 20, 16, {
  topLeft: 8,
  topRight: 8,
  bottomRight: 8,
  bottomLeft: 1.85
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
    // The back/shadow bubble is deliberately NOT tagged "flinchBody": it
    // reads as a static backdrop, not part of the character, so a click
    // reaction should only move the front bubble (with the eyes) that
    // actually reads as "the creature".
    { kind: "path", d: INK_BUBBLE_PATH, fillRole: "shadow" },
    { kind: "path", d: CLAY_BUBBLE_PATH, fillRole: "accent", slot: "flinchBody" }
  ],
  features: {
    leftEye: { cx: 10, cy: 14, fillRole: "light" },
    rightEye: { cx: 18, cy: 14, fillRole: "light" }
  },
  eyeShapesByState: chatticusEyeShapesByState,
  blink: { closedRx: 2, closedRy: 0.3 },
  gaze: {
    travel: { left: 1.4, right: 1.4, up: 1.1, down: 1.1 },
    // Eyes are r=2 dots (open height 4); squashing to 15% reads as a
    // clean, near-flat dash rather than just a slightly shorter dot.
    blinkClosedScaleY: 0.15,
    // Safe here because the mark always uses neutralIdleMode="static" —
    // there's no GSAP idle system also animating the root group.
    bodyFlinch: true,
    bodyFlinchRecoilDistance: 2.6
  }
});
