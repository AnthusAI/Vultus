export { BotAvatar } from "./BotAvatar";
export type { BotAvatarProps } from "./BotAvatar";
export {
  BOT_AVATAR_STATES,
  automatedSpeakingPlaybackSequence,
  computeAllFacialPathsForState,
  formatStateKeyAsReadableLabel,
  orderedStateButtonDescriptors
} from "./avatarStates";
export type { BotAvatarState, FacialShapeDefinition } from "./avatarStates";
export {
  avatarModelFromZoo,
  createBotAvatarModelZoo,
  defineLottieAvatarModel,
  defineProceduralAvatarModel,
  VULTUS_CLASSIC_MODEL
} from "./avatarModels";
export type {
  BotAvatarModel,
  BotAvatarModelZoo,
  ClipCircle,
  FeatureAnchor,
  FillRole,
  LottieAnimationData,
  LottieAvatarModel,
  LottieFrameSegment,
  ProceduralAvatarModel,
  ProceduralShape,
  RigSlot
} from "./avatarModels";
export {
  CREATIVE_DESK_MODEL_ZOO,
  creativeDeskModelForRole,
  creativeMotionAnimation
} from "./creativeDeskModels";
export type { CreativeMotionState, CreativeRole } from "./creativeDeskModels";
export { CHATTICUS_MARK_MODEL } from "./chatticusModels";
export { buildCharacterModel, characterColorProps, characterGazeConfig } from "./characterModels";
export type {
  CharacterBodyCorner,
  CharacterBodySpec,
  CharacterColors,
  CharacterEyeSpec,
  CharacterMouthSpec,
  CharacterSpec
} from "./characterModels";
export { creativeCharacterModelForRole, creativeCharacterSpecForRole } from "./creativeCharacterModels";
export type { CreativeCharacterRole } from "./creativeCharacterModels";
export {
  DEFAULT_GAZE_CONFIG,
  NEUTRAL_GAZE_VECTOR,
  advanceBlinkState,
  advanceGazeWander,
  applyBlinkScale,
  applyBodyFlinchRecoil,
  applyGazeTravel,
  buildBodyFlinchSteps,
  clampUnit,
  computePointerGazeVector,
  createBlinkState,
  createGazeWanderState,
  isPointerWithinProximity,
  makeSeededRandom
} from "./gaze";
export type {
  BlinkPhase,
  BlinkState,
  BodyFlinchStep,
  GazeConfig,
  GazeGeometry,
  GazeSource,
  GazeVector,
  GazeWanderPhase,
  GazeWanderState
} from "./gaze";
