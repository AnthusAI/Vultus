import { BotAvatarState } from "./avatarStates";
import type { BotAvatarModel } from "./avatarModels";
export type BotAvatarProps = {
    model?: BotAvatarModel;
    state?: BotAvatarState;
    neutralIdleMode?: "bored-random" | "static";
    size?: number;
    transitionDurationSeconds?: number;
    shadowColor?: string;
    lightColor?: string;
    ariaLabel?: string;
    paused?: boolean;
};
export declare const BotAvatar: ({ model, state, size, lightColor, ariaLabel, paused, ...proceduralProps }: BotAvatarProps) => import("react/jsx-runtime").JSX.Element;
