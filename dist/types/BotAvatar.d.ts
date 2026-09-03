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
    /**
     * When set (and `gaze` isn't "none"), the avatar looks at this DOM
     * element's center instead of the pointer/wander -- e.g. a caller's own
     * "typing…" indicator, so the character visibly notices it. Overrides
     * pointer tracking and autonomous wander for as long as it's set;
     * reverts the moment it's cleared. Independent of `gaze`'s own mode,
     * same as a fixed-vector `gaze` is -- but sourced from a live element's
     * position rather than a static direction.
     */
    focusElement?: Element | null;
};
export declare const BotAvatar: ({ model, state, size, lightColor, ariaLabel, paused, ...proceduralProps }: BotAvatarProps) => import("react/jsx-runtime").JSX.Element;
