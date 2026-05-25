import { BotAvatarState } from "./avatarStates";
export type BotAvatarProps = {
    state?: BotAvatarState;
    size?: number;
    transitionDurationSeconds?: number;
    shadowColor?: string;
    lightColor?: string;
    ariaLabel?: string;
};
export declare const BotAvatar: ({ state, size, transitionDurationSeconds, shadowColor, lightColor, ariaLabel }: BotAvatarProps) => import("react/jsx-runtime").JSX.Element;
