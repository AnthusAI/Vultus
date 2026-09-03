import type { RefObject } from "react";
import type { GazeConfig, GazeGeometry, GazeSource } from "./gaze";
export type UseGazeBehaviorOptions = {
    svgElementRef: RefObject<SVGSVGElement>;
    /** Carries position only (translate) — pointer tracking / autonomous wander. */
    gazeGroupElementRef: RefObject<SVGGElement>;
    /** Carries eyelid only (scaleY) — idle blink / defensive squint. Nested inside gazeGroupElementRef. */
    eyelidGroupElementRef: RefObject<SVGGElement>;
    /** The model's flinchable rig group; only used when geometry.bodyFlinch is true. */
    bodyElementRef?: RefObject<SVGGElement>;
    gaze: GazeSource;
    geometry?: GazeGeometry;
    config?: Partial<GazeConfig>;
    /** When set, the avatar looks at this element's center instead of the pointer/wander. See BotAvatarProps.focusElement. */
    focusElement?: Element | null;
};
/**
 * Drives a model's gaze from real time, real pointer events, and real
 * media queries. All the actual behavior (what vector/eyelid to show,
 * when to transition) is the pure, tested logic in gaze.ts — this hook
 * is just the event/timer/DOM plumbing around it.
 *
 * Position (translate, on gazeGroupElementRef) and eyelid (scaleY, on
 * the nested eyelidGroupElementRef) are deliberately two separate CSS
 * transforms on two separate elements: they're driven by independent
 * schedulers (wander/tracking vs. blink/squint) that need independent
 * transition durations, which one shared `transform` property can't give
 * them — a fast 90ms blink and a slow 900ms glance can't both be "the"
 * duration of one combined translate+scaleY transition.
 */
export declare function useGazeBehavior({ svgElementRef, gazeGroupElementRef, eyelidGroupElementRef, bodyElementRef, gaze, geometry, config, focusElement }: UseGazeBehaviorOptions): void;
