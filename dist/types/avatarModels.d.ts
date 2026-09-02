import type { BotAvatarState, FacialShapeDefinition } from "./avatarStates";
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
export type ProceduralShape = {
    kind: "circle";
    cx: number;
    cy: number;
    r: number;
    fillRole: FillRole;
    slot?: RigSlot;
} | {
    kind: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
    rx?: number;
    ry?: number;
    fillRole: FillRole;
    slot?: RigSlot;
} | {
    kind: "path";
    d: string;
    fillRole: FillRole;
    slot?: RigSlot;
};
export type ClipCircle = {
    cx: number;
    cy: number;
    r: number;
};
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
    blink: {
        closedRx: number;
        closedRy: number;
    };
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
export declare function defineProceduralAvatarModel(model: Omit<ProceduralAvatarModel, "renderer">): ProceduralAvatarModel;
export declare function defineLottieAvatarModel(model: Omit<LottieAvatarModel, "renderer">): LottieAvatarModel;
export declare function createBotAvatarModelZoo(models: readonly BotAvatarModel[]): BotAvatarModelZoo;
/**
 * The original Vultus robot head, re-expressed as data. Output must stay
 * byte-identical to the pre-refactor hardcoded JSX — see
 * src/test/classicModel.golden.test.tsx.
 */
export declare const VULTUS_CLASSIC_MODEL: ProceduralAvatarModel;
export declare function avatarModelFromZoo(zoo: BotAvatarModelZoo, modelId: string, fallback?: BotAvatarModel): BotAvatarModel;
