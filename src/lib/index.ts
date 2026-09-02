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
export {
  DEFAULT_GAZE_CONFIG,
  NEUTRAL_GAZE_VECTOR,
  advanceGazeWander,
  applyGazeTravel,
  clampUnit,
  computePointerGazeVector,
  createGazeWanderState,
  isPointerWithinProximity,
  makeSeededRandom
} from "./gaze";
export type { GazeConfig, GazeGeometry, GazeSource, GazeVector, GazeWanderPhase, GazeWanderState } from "./gaze";
