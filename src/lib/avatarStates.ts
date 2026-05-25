import { buildFourSegmentCurvedLensPath, buildFourSegmentEllipsePath } from "./avatarMath";

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

type FacialShapeDefinition = {
  rx: number;
  ry: number;
  dy: number;
  shape: "ellipse" | "curvedLens";
  curveDirection?: "up" | "down";
};

const FACIAL_FEATURE_GEOMETRY = {
  leftEyeCenterX: 70,
  rightEyeCenterX: 130,
  eyeBaselineCenterY: 90,
  mouthCenterX: 100,
  mouthBaselineCenterY: 122
} as const;

const eyeShapeDefinitionsByState: Record<BotAvatarState, FacialShapeDefinition> = {
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

const mouthShapeDefinitionsByState: Record<BotAvatarState, FacialShapeDefinition> = {
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

export const computeAllFacialPathsForState = (stateName: BotAvatarState) => {
  const eyeDefinition = eyeShapeDefinitionsByState[stateName];
  const mouthDefinition = mouthShapeDefinitionsByState[stateName];
  return {
    leftEyePathString: buildPathStringFromDefinition(
      FACIAL_FEATURE_GEOMETRY.leftEyeCenterX,
      FACIAL_FEATURE_GEOMETRY.eyeBaselineCenterY,
      eyeDefinition
    ),
    rightEyePathString: buildPathStringFromDefinition(
      FACIAL_FEATURE_GEOMETRY.rightEyeCenterX,
      FACIAL_FEATURE_GEOMETRY.eyeBaselineCenterY,
      eyeDefinition
    ),
    mouthPathString: buildPathStringFromDefinition(
      FACIAL_FEATURE_GEOMETRY.mouthCenterX,
      FACIAL_FEATURE_GEOMETRY.mouthBaselineCenterY,
      mouthDefinition
    )
  };
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
