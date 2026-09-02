import { buildFourSegmentCurvedLensPath, buildFourSegmentEllipsePath } from "./avatarMath";
import type { ProceduralAvatarModel } from "./avatarModels";

export const BOT_AVATAR_STATES = [
  "neutral",
  "thinking",
  "deepThinking",
  "toolCalling",
  "toolResponse",
  "speakingOpen",
  "speakingWide",
  "speakingRound",
  "speakingComplete"
] as const;

export type BotAvatarState = (typeof BOT_AVATAR_STATES)[number];

export type FacialShapeDefinition = {
  rx: number;
  ry: number;
  dy: number;
  shape: "ellipse" | "curvedLens";
  curveDirection?: "up" | "down";
};

/**
 * Shape tables for VULTUS_CLASSIC_MODEL's facial features. Exported so
 * avatarModels.ts can build the classic model from them; a different
 * procedural model supplies its own tables instead.
 */
export const classicEyeShapeDefinitionsByState: Record<BotAvatarState, FacialShapeDefinition> = {
  neutral: { rx: 14, ry: 14, dy: 0, shape: "ellipse" },
  thinking: { rx: 14, ry: 14, dy: -4, shape: "ellipse" },
  deepThinking: { rx: 17, ry: 2, dy: 0, shape: "ellipse" },
  toolCalling: { rx: 5, ry: 16, dy: 0, shape: "ellipse" },
  toolResponse: { rx: 17, ry: 17, dy: 0, shape: "ellipse" },
  speakingOpen: { rx: 14, ry: 14, dy: 0, shape: "ellipse" },
  speakingWide: { rx: 14, ry: 14, dy: 0, shape: "ellipse" },
  speakingRound: { rx: 14, ry: 14, dy: 0, shape: "ellipse" },
  speakingComplete: { rx: 16, ry: 5, dy: -1, shape: "curvedLens", curveDirection: "up" }
};

export const classicMouthShapeDefinitionsByState: Record<BotAvatarState, FacialShapeDefinition> = {
  neutral: { rx: 25, ry: 10, dy: 0, shape: "curvedLens", curveDirection: "down" },
  thinking: { rx: 6, ry: 6, dy: 0, shape: "ellipse" },
  deepThinking: { rx: 24, ry: 2, dy: 0, shape: "ellipse" },
  toolCalling: { rx: 7, ry: 7, dy: 0, shape: "ellipse" },
  toolResponse: { rx: 9, ry: 14, dy: 0, shape: "ellipse" },
  speakingOpen: { rx: 13, ry: 18, dy: 5, shape: "ellipse" },
  speakingWide: { rx: 22, ry: 7, dy: 0, shape: "ellipse" },
  speakingRound: { rx: 10, ry: 13, dy: 0, shape: "ellipse" },
  speakingComplete: { rx: 25, ry: 11, dy: 0, shape: "curvedLens", curveDirection: "down" }
};

const buildPathStringFromDefinition = (
  centerX: number,
  centerY: number,
  definition: FacialShapeDefinition
): string => {
  const adjustedCenterY = centerY + definition.dy;
  if (definition.shape === "curvedLens") {
    return buildFourSegmentCurvedLensPath(
      centerX,
      adjustedCenterY,
      definition.rx,
      definition.ry,
      definition.curveDirection ?? "down"
    );
  }
  return buildFourSegmentEllipsePath(centerX, adjustedCenterY, definition.rx, definition.ry);
};

/**
 * Computes facial feature paths for a model at a given state. Feature
 * anchors (where the eyes/mouth sit) and per-state shape tables both come
 * from the model, so this works for any procedural model, not just the
 * classic robot. `mouthPathString` is "" when the model has no mouth
 * feature or no shape table entry for this state.
 */
export const computeAllFacialPathsForState = (
  model: ProceduralAvatarModel,
  stateName: BotAvatarState
) => {
  const eyeDefinition = model.eyeShapesByState[stateName];
  const mouthDefinition = model.mouthShapesByState?.[stateName];
  const leftEyePathString = buildPathStringFromDefinition(
    model.features.leftEye.cx,
    model.features.leftEye.cy,
    eyeDefinition
  );
  const rightEyePathString = buildPathStringFromDefinition(
    model.features.rightEye.cx,
    model.features.rightEye.cy,
    eyeDefinition
  );
  const mouthPathString =
    model.features.mouth && mouthDefinition
      ? buildPathStringFromDefinition(model.features.mouth.cx, model.features.mouth.cy, mouthDefinition)
      : "";
  return { leftEyePathString, rightEyePathString, mouthPathString };
};

export const orderedStateButtonDescriptors = [
  { stateKey: "neutral", buttonLabel: "Neutral", romanNumeralIndex: "I" },
  { stateKey: "thinking", buttonLabel: "Thinking", romanNumeralIndex: "II" },
  { stateKey: "deepThinking", buttonLabel: "Deep Thinking", romanNumeralIndex: "III" },
  { stateKey: "toolCalling", buttonLabel: "Tool Calling", romanNumeralIndex: "IV" },
  { stateKey: "toolResponse", buttonLabel: "Tool Response", romanNumeralIndex: "V" },
  { stateKey: "speakingOpen", buttonLabel: "Speaking · Open", romanNumeralIndex: "VI" },
  { stateKey: "speakingWide", buttonLabel: "Speaking · Wide", romanNumeralIndex: "VII" },
  { stateKey: "speakingRound", buttonLabel: "Speaking · Round", romanNumeralIndex: "VIII" },
  { stateKey: "speakingComplete", buttonLabel: "Speaking Complete", romanNumeralIndex: "IX" }
] as const satisfies ReadonlyArray<{
  stateKey: BotAvatarState;
  buttonLabel: string;
  romanNumeralIndex: string;
}>;

export const automatedSpeakingPlaybackSequence = [
  { stateKey: "speakingOpen", holdMilliseconds: 280 },
  { stateKey: "speakingRound", holdMilliseconds: 220 },
  { stateKey: "speakingWide", holdMilliseconds: 260 },
  { stateKey: "speakingOpen", holdMilliseconds: 220 },
  { stateKey: "speakingRound", holdMilliseconds: 200 },
  { stateKey: "speakingWide", holdMilliseconds: 260 },
  { stateKey: "speakingComplete", holdMilliseconds: 900 },
  { stateKey: "neutral", holdMilliseconds: 0 }
] as const satisfies ReadonlyArray<{
  stateKey: BotAvatarState;
  holdMilliseconds: number;
}>;

export const formatStateKeyAsReadableLabel = (stateKey: BotAvatarState): string =>
  stateKey
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (firstCharacter) => firstCharacter.toUpperCase())
    .trim();
