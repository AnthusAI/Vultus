import type { BotAvatarState } from "./avatarStates";
import type { LottieAvatarModel } from "./avatarModels";
export type LottieBotAvatarProps = {
    model: LottieAvatarModel;
    state: BotAvatarState;
    size: number;
    lightColor: string;
    ariaLabel?: string;
    paused?: boolean;
};
export declare function LottieBotAvatar({ model, state, size, lightColor, ariaLabel, paused }: LottieBotAvatarProps): import("react/jsx-runtime").JSX.Element;
