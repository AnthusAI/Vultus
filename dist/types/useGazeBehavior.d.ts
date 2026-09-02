import type { RefObject } from "react";
import type { GazeConfig, GazeGeometry, GazeSource } from "./gaze";
export type UseGazeBehaviorOptions = {
    svgElementRef: RefObject<SVGSVGElement>;
    gazeGroupElementRef: RefObject<SVGGElement>;
    gaze: GazeSource;
    geometry?: GazeGeometry;
    config?: Partial<GazeConfig>;
};
/**
 * Drives a model's gaze from real time, real pointer events, and real
 * media queries. All the actual behavior (what vector to show, when to
 * transition) is the pure, tested logic in gaze.ts — this hook is just
 * the event/timer/DOM plumbing around it. Applies a `transform:
 * translate(...)` + `transition` directly on `gazeGroupElementRef`
 * (SVG's `transform-box` defaults to the element's own coordinate space,
 * so these translate values are in the model's own viewBox units).
 */
export declare function useGazeBehavior({ svgElementRef, gazeGroupElementRef, gaze, geometry, config }: UseGazeBehaviorOptions): void;
