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
export declare const CHATTICUS_MARK_MODEL: import("./avatarModels").ProceduralAvatarModel;
