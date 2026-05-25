import { BotAvatarState } from "./avatarStates";
export type BotAvatarProps = {
    state?: BotAvatarState;
    neutralIdleMode?: "bored-random" | "static";
    size?: number;
    transitionDurationSeconds?: number;
    shadowColor?: string;
    lightColor?: string;
    ariaLabel?: string;
};
export declare const BotAvatar: ({ state, neutralIdleMode, size, transitionDurationSeconds, shadowColor, lightColor, ariaLabel }: BotAvatarProps) => import("react/jsx-runtime").JSX.Element;
