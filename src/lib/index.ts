export { BotAvatar } from "./BotAvatar";
export type { BotAvatarProps } from "./BotAvatar";
export {
  BOT_AVATAR_STATES,
  automatedSpeakingPlaybackSequence,
  computeAllFacialPathsForState,
  formatStateKeyAsReadableLabel,
  orderedStateButtonDescriptors
} from "./avatarStates";
export type { BotAvatarState } from "./avatarStates";
export {
  avatarModelFromZoo,
  createBotAvatarModelZoo,
  defineLottieAvatarModel,
  VULTUS_CLASSIC_MODEL
} from "./avatarModels";
export type {
  BotAvatarModel,
  BotAvatarModelZoo,
  LottieAnimationData,
  LottieAvatarModel,
  LottieFrameSegment,
  ProceduralAvatarModel
} from "./avatarModels";
export {
  CREATIVE_DESK_MODEL_ZOO,
  creativeDeskModelForRole,
  creativeMotionAnimation
} from "./creativeDeskModels";
export type { CreativeMotionState, CreativeRole } from "./creativeDeskModels";
