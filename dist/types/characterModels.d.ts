import type { ProceduralAvatarModel, ProceduralShape } from "./avatarModels";
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
/** Renders this character's colors via BotAvatar's standard 3-slot color props (shadowColor/lightColor/accentColor). */
export declare function characterColorProps(spec: CharacterSpec): {
    shadowColor: string;
    lightColor: string;
    accentColor?: string;
};
/** Animation-timing overrides implementing `temperament`: pass as BotAvatar's `gazeConfig` prop. */
export declare function characterGazeConfig(spec: CharacterSpec): Partial<GazeConfig>;
/** Builds a real ProceduralAvatarModel from a CharacterSpec. */
export declare function buildCharacterModel(spec: CharacterSpec): ProceduralAvatarModel;
