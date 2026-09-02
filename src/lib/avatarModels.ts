import type { BotAvatarState, FacialShapeDefinition } from "./avatarStates";
import { classicEyeShapeDefinitionsByState, classicMouthShapeDefinitionsByState } from "./avatarStates";
import type { GazeGeometry } from "./gaze";

export type LottieAnimationData = Record<string, unknown>;
export type LottieFrameSegment = readonly [number, number];

/** Named ref slots a procedural rig can expose for animation targeting. */
export type RigSlot = "root" | "leftEye" | "rightEye" | "mouth" | "accent";

/**
 * Which of a model's three configurable colors a shape or feature paints
 * with: `shadowColor`/`lightColor` are the existing BotAvatar props
 * (reused for any two-tone model, not just literally "dark on light");
 * `accentColor` is a third color for models that need one (e.g. a third
 * brand color), and defaults to `lightColor` when unset.
 */
export type FillRole = "shadow" | "light" | "accent";

export type FeatureAnchor = {
  cx: number;
  cy: number;
  fillRole: FillRole;
};

export type ProceduralShape =
  | { kind: "circle"; cx: number; cy: number; r: number; fillRole: FillRole; slot?: RigSlot }
  | {
      kind: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
      rx?: number;
      ry?: number;
      fillRole: FillRole;
      slot?: RigSlot;
    }
  | { kind: "path"; d: string; fillRole: FillRole; slot?: RigSlot };

export type ClipCircle = { cx: number; cy: number; r: number };

export type ProceduralAvatarModel = {
  id: string;
  name: string;
  renderer: "procedural";
  /** [minX, minY, width, height], in the model's own coordinate space. */
  viewBox: readonly [number, number, number, number];
  /** Full-bleed background rect fill role; omit for a transparent background. */
  background?: FillRole;
  /** Circular clip applied to `body` and the eye/mouth features; omit for no clip. */
  clipShape?: ClipCircle;
  /** Drawn before the clip is applied (e.g. a shadow silhouette behind a clipped face). */
  underlayShapes?: readonly ProceduralShape[];
  /** Drawn inside the clip (or directly, if there is no clip), in order. */
  body: readonly ProceduralShape[];
  features: {
    leftEye: FeatureAnchor;
    rightEye: FeatureAnchor;
    /** Omit for a mouthless model (e.g. a logo mark). */
    mouth?: FeatureAnchor;
  };
  eyeShapesByState: Record<BotAvatarState, FacialShapeDefinition>;
  /** Omit for a mouthless model. */
  mouthShapesByState?: Record<BotAvatarState, FacialShapeDefinition>;
  /** Eye ellipse dimensions at full blink closure. */
  blink: { closedRx: number; closedRy: number };
  /** CSS transform-origin for whole-rig transforms (breathing, bounce). */
  rootTransformOrigin?: string;
  /** Eye-travel budget for the `gaze` prop. Omit for models that don't support gaze. */
  gaze?: GazeGeometry;
};

export type LottieAvatarModel = {
  id: string;
  name: string;
  renderer: "lottie";
  animationData: LottieAnimationData;
  stateSegments: Partial<Record<BotAvatarState, LottieFrameSegment>>;
  fallbackSegment: LottieFrameSegment;
};

export type BotAvatarModel = ProceduralAvatarModel | LottieAvatarModel;
export type BotAvatarModelZoo = Readonly<Record<string, BotAvatarModel>>;

export function defineProceduralAvatarModel(
  model: Omit<ProceduralAvatarModel, "renderer">
): ProceduralAvatarModel {
  return Object.freeze({ ...model, renderer: "procedural" });
}

export function defineLottieAvatarModel(
  model: Omit<LottieAvatarModel, "renderer">
): LottieAvatarModel {
  return Object.freeze({ ...model, renderer: "lottie" });
}

export function createBotAvatarModelZoo(models: readonly BotAvatarModel[]): BotAvatarModelZoo {
  const entries = models.map((model) => [model.id, model] as const);
  const identifiers = entries.map(([identifier]) => identifier);
  if (new Set(identifiers).size !== identifiers.length) {
    throw new Error("Vultus model identifiers must be unique.");
  }
  return Object.freeze(Object.fromEntries(entries));
}

/**
 * The original Vultus robot head, re-expressed as data. Output must stay
 * byte-identical to the pre-refactor hardcoded JSX — see
 * src/test/classicModel.golden.test.tsx.
 */
export const VULTUS_CLASSIC_MODEL: ProceduralAvatarModel = defineProceduralAvatarModel({
  id: "vultus-classic",
  name: "Vultus Classic",
  viewBox: [0, 0, 200, 200],
  background: "light",
  clipShape: { cx: 100, cy: 100, r: 90 },
  underlayShapes: [{ kind: "circle", cx: 100, cy: 100, r: 90, fillRole: "shadow" }],
  body: [
    { kind: "circle", cx: 100, cy: 20, r: 10, fillRole: "light", slot: "accent" },
    { kind: "rect", x: 95, y: 25, width: 10, height: 25, fillRole: "light" },
    { kind: "rect", x: 15, y: 80, width: 30, height: 40, rx: 8, fillRole: "light" },
    { kind: "rect", x: 155, y: 80, width: 30, height: 40, rx: 8, fillRole: "light" },
    { kind: "rect", x: 35, y: 45, width: 130, height: 100, rx: 30, fillRole: "light" },
    { kind: "rect", x: 80, y: 140, width: 40, height: 20, fillRole: "light" },
    { kind: "path", d: "M 20 200 Q 100 150 180 200 Z", fillRole: "light" }
  ],
  features: {
    leftEye: { cx: 70, cy: 90, fillRole: "shadow" },
    rightEye: { cx: 130, cy: 90, fillRole: "shadow" },
    mouth: { cx: 100, cy: 122, fillRole: "shadow" }
  },
  eyeShapesByState: classicEyeShapeDefinitionsByState,
  mouthShapesByState: classicMouthShapeDefinitionsByState,
  blink: { closedRx: 13, closedRy: 1.5 },
  rootTransformOrigin: "100px 100px"
});

export function avatarModelFromZoo(
  zoo: BotAvatarModelZoo,
  modelId: string,
  fallback: BotAvatarModel = VULTUS_CLASSIC_MODEL
): BotAvatarModel {
  return zoo[modelId] ?? fallback;
}
