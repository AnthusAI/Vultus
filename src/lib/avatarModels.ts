import type { BotAvatarState } from "./avatarStates";

export type LottieAnimationData = Record<string, unknown>;
export type LottieFrameSegment = readonly [number, number];

export type ProceduralAvatarModel = {
  id: string;
  name: string;
  renderer: "procedural";
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

export const VULTUS_CLASSIC_MODEL: ProceduralAvatarModel = Object.freeze({
  id: "vultus-classic",
  name: "Vultus Classic",
  renderer: "procedural"
});

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

export function avatarModelFromZoo(
  zoo: BotAvatarModelZoo,
  modelId: string,
  fallback: BotAvatarModel = VULTUS_CLASSIC_MODEL
): BotAvatarModel {
  return zoo[modelId] ?? fallback;
}
