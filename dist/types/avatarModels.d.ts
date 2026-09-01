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
export declare const VULTUS_CLASSIC_MODEL: ProceduralAvatarModel;
export declare function defineLottieAvatarModel(model: Omit<LottieAvatarModel, "renderer">): LottieAvatarModel;
export declare function createBotAvatarModelZoo(models: readonly BotAvatarModel[]): BotAvatarModelZoo;
export declare function avatarModelFromZoo(zoo: BotAvatarModelZoo, modelId: string, fallback?: BotAvatarModel): BotAvatarModel;
