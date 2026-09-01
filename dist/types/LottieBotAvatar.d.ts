import type { BotAvatarState } from "./avatarStates";
import type { LottieAvatarModel } from "./avatarModels";
export type LottieBotAvatarProps = {
    model: LottieAvatarModel;
    state: BotAvatarState;
    size: number;
    lightColor: string;
    ariaLabel?: string;
};
export declare function LottieBotAvatar({ model, state, size, lightColor, ariaLabel }: LottieBotAvatarProps): import("react/jsx-runtime").JSX.Element;
