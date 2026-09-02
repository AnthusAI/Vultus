/**
 * A parameterized character factory: describe a character with a small,
 * declarative spec (body shape, eye shape, optional accessories, default
 * colors, and how "energetic" its idle behavior feels) and get back a
 * real ProceduralAvatarModel — fully compatible with everything BotAvatar
 * already does (gaze tracking, autonomous wander, idle blink, defensive
 * squint, click flinch). The goal is that adding a new character is
 * writing a spec, not hand-building SVG geometry.
 *
 * These are a separate, general-purpose family from CHATTICUS_MARK_MODEL
 * (the wordmark logo, a fixed two-bubble composition) — every character
 * built here is a single body shape + eyes, styled in the spirit of the
 * logo's front-facing bubble, not a copy of the logo itself.
 */
import { buildRoundedRectPath } from "./avatarMath";
import { defineProceduralAvatarModel } from "./avatarModels";
import type { ProceduralAvatarModel, ProceduralShape } from "./avatarModels";
import { BOT_AVATAR_STATES } from "./avatarStates";
import type { BotAvatarState, FacialShapeDefinition } from "./avatarStates";
import { DEFAULT_GAZE_CONFIG } from "./gaze";
import type { GazeConfig, GazeGeometry } from "./gaze";

/** Which corner of the body stays a small, sharp radius — a "tail" that gives an otherwise-rounded shape a directional, speech-bubble-like read. "none" makes a fully rounded blob. */
export type CharacterBodyCorner = "topLeft" | "topRight" | "bottomLeft" | "bottomRight" | "none";

export type CharacterBodySpec = {
  width: number;
  height: number;
  /** 0..1: how rounded the non-sharp corners are, relative to half the shorter side. 1 = fully pill-shaped on that side. */
  roundness: number;
  sharpCorner: CharacterBodyCorner;
  /** Radius of the sharp corner, in user units. Ignored when sharpCorner is "none". */
  sharpCornerRadius: number;
};

export type CharacterEyeSpec = {
  radiusX: number;
  radiusY: number;
  /** Distance between the two eye centers. */
  spacing: number;
  /** Eye center Y, relative to the viewBox's vertical center (positive = lower). */
  offsetY: number;
};

export type CharacterMouthSpec = {
  radiusX: number;
  radiusY: number;
  /** Mouth center Y, relative to the viewBox's vertical center (positive = lower). */
  offsetY: number;
};

export type CharacterColors = {
  body: string;
  eye: string;
  /** Used by accessory shapes tagged fillRole: "accent"; harmless to omit if none are. */
  accent?: string;
};

export type CharacterSpec = {
  id: string;
  name: string;
  /** Square canvas size, e.g. 28 (matches the wordmark's native scale). */
  viewBoxSize: number;
  body: CharacterBodySpec;
  eyes: CharacterEyeSpec;
  mouth?: CharacterMouthSpec;
  /**
   * Extra static shapes layered on top of the body (eyebrows, a hat, ...),
   * in the character's own viewBox coordinates. Rendered in order, after
   * the body and before the eyes/mouth, and included in the click-flinch
   * group — they move with the character, not the backdrop.
   */
  accessories?: ProceduralShape[];
  colors: CharacterColors;
  /** Scales idle-behavior frequency: 1 = default feel, >1 = more energetic/frequent, <1 = calmer. */
  temperament?: number;
  /** Escape hatch for bespoke per-character gaze geometry instead of the size-derived defaults. */
  gazeOverrides?: Partial<GazeGeometry>;
};

const clampUnitInterval = (value: number): number => Math.max(0, Math.min(1, value));

const computeBodyCornerRadii = (body: CharacterBodySpec) => {
  const maxRadius = Math.min(body.width, body.height) / 2;
  const roundedRadius = maxRadius * clampUnitInterval(body.roundness);
  const radii = {
    topLeft: roundedRadius,
    topRight: roundedRadius,
    bottomRight: roundedRadius,
    bottomLeft: roundedRadius
  };
  if (body.sharpCorner !== "none") {
    radii[body.sharpCorner] = body.sharpCornerRadius;
  }
  return radii;
};

/** Eye-travel budget and blink/flinch geometry, scaled from the body's own size — see CHATTICUS_MARK_MODEL for the reference proportions this is derived from. */
const TRAVEL_RATIO = 0.07;
const RECOIL_RATIO = 0.13;

const computeGazeGeometry = (body: CharacterBodySpec, overrides?: Partial<GazeGeometry>): GazeGeometry => {
  const travelX = body.width * TRAVEL_RATIO;
  const travelY = body.height * TRAVEL_RATIO;
  return {
    travel: { left: travelX, right: travelX, up: travelY, down: travelY },
    blinkClosedScaleY: 0.15,
    bodyFlinch: true,
    bodyFlinchRecoilDistance: Math.min(body.width, body.height) * RECOIL_RATIO,
    ...overrides
  };
};

/** Renders this character's colors via BotAvatar's standard 3-slot color props (shadowColor/lightColor/accentColor). */
export function characterColorProps(spec: CharacterSpec): { shadowColor: string; lightColor: string; accentColor?: string } {
  return { shadowColor: spec.colors.body, lightColor: spec.colors.eye, accentColor: spec.colors.accent };
}

/** Animation-timing overrides implementing `temperament`: pass as BotAvatar's `gazeConfig` prop. */
export function characterGazeConfig(spec: CharacterSpec): Partial<GazeConfig> {
  const temperament = spec.temperament ?? 1;
  if (temperament === 1) {
    return {};
  }
  return {
    wanderMinMs: DEFAULT_GAZE_CONFIG.wanderMinMs / temperament,
    wanderMaxMs: DEFAULT_GAZE_CONFIG.wanderMaxMs / temperament,
    blinkMinMs: DEFAULT_GAZE_CONFIG.blinkMinMs / temperament,
    blinkMaxMs: DEFAULT_GAZE_CONFIG.blinkMaxMs / temperament,
    blinkSubsequentMinMs: DEFAULT_GAZE_CONFIG.blinkSubsequentMinMs / temperament,
    blinkSubsequentMaxMs: DEFAULT_GAZE_CONFIG.blinkSubsequentMaxMs / temperament
  };
}

const uniformShapeByState = (shape: FacialShapeDefinition): Record<BotAvatarState, FacialShapeDefinition> =>
  Object.fromEntries(BOT_AVATAR_STATES.map((state) => [state, shape])) as Record<BotAvatarState, FacialShapeDefinition>;

/** Builds a real ProceduralAvatarModel from a CharacterSpec. */
export function buildCharacterModel(spec: CharacterSpec): ProceduralAvatarModel {
  const center = spec.viewBoxSize / 2;
  const bodyPath = buildRoundedRectPath(
    center - spec.body.width / 2,
    center - spec.body.height / 2,
    spec.body.width,
    spec.body.height,
    computeBodyCornerRadii(spec.body)
  );

  const leftEyeCx = center - spec.eyes.spacing / 2;
  const rightEyeCx = center + spec.eyes.spacing / 2;
  const eyeCy = center + spec.eyes.offsetY;
  const restingEyeShape: FacialShapeDefinition = { rx: spec.eyes.radiusX, ry: spec.eyes.radiusY, dy: 0, shape: "ellipse" };

  const mouthCy = spec.mouth ? center + spec.mouth.offsetY : undefined;
  const restingMouthShape: FacialShapeDefinition | undefined = spec.mouth
    ? { rx: spec.mouth.radiusX, ry: spec.mouth.radiusY, dy: 0, shape: "ellipse" }
    : undefined;

  return defineProceduralAvatarModel({
    id: spec.id,
    name: spec.name,
    viewBox: [0, 0, spec.viewBoxSize, spec.viewBoxSize],
    body: [
      { kind: "path", d: bodyPath, fillRole: "shadow", slot: "flinchBody" },
      ...(spec.accessories ?? []).map((shape) => ({ ...shape, slot: "flinchBody" as const }))
    ],
    features: {
      leftEye: { cx: leftEyeCx, cy: eyeCy, fillRole: "light" },
      rightEye: { cx: rightEyeCx, cy: eyeCy, fillRole: "light" },
      ...(spec.mouth ? { mouth: { cx: center, cy: mouthCy!, fillRole: "light" as const } } : {})
    },
    eyeShapesByState: uniformShapeByState(restingEyeShape),
    ...(restingMouthShape ? { mouthShapesByState: uniformShapeByState(restingMouthShape) } : {}),
    blink: { closedRx: spec.eyes.radiusX, closedRy: spec.eyes.radiusY * 0.15 },
    gaze: computeGazeGeometry(spec.body, spec.gazeOverrides)
  });
}
