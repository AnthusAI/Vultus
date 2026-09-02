import { BotAvatarState } from "./avatarStates";
import type { BotAvatarModel } from "./avatarModels";
import type { GazeConfig, GazeSource } from "./gaze";
export type BotAvatarProps = {
    model?: BotAvatarModel;
    state?: BotAvatarState;
    neutralIdleMode?: "bored-random" | "static";
    size?: number;
    transitionDurationSeconds?: number;
    shadowColor?: string;
    lightColor?: string;
    /** Third color for models with "accent"-role shapes/features. Defaults to lightColor. */
    accentColor?: string;
    ariaLabel?: string;
    paused?: boolean;
    /**
     * Continuous gaze/pointer-following, independent of `state`. Defaults to
     * "none" (no change from prior behavior). Only has an effect on models
     * that declare `gaze` geometry; ignored otherwise.
     */
    gaze?: GazeSource;
    gazeConfig?: Partial<GazeConfig>;
};
export declare const BotAvatar: ({ model, state, size, lightColor, ariaLabel, paused, ...proceduralProps }: BotAvatarProps) => import("react/jsx-runtime").JSX.Element;
