export declare const buildFourSegmentEllipsePath: (centerX: number, centerY: number, radiusX: number, radiusY: number) => string;
export declare const buildFourSegmentCurvedLensPath: (centerX: number, centerY: number, radiusX: number, radiusY: number, curveDirection: "up" | "down") => string;
export type RoundedRectCornerRadii = {
    topLeft: number;
    topRight: number;
    bottomRight: number;
    bottomLeft: number;
};
/**
 * A rectangle with an independently-specified radius per corner, matching
 * how CSS border-radius shorthand (`tl tr br bl`) actually renders. Each
 * corner becomes its own quarter-circle arc command rather than one arc
 * spanning an entire edge, so a corner whose two radii sum to the full
 * edge length (a "capped" end, e.g. a semicircle) stays two well-defined
 * 90-degree arcs instead of one 180-degree arc — a single arc whose start
 * and end points are diametrically opposite is flag-ambiguous in some SVG
 * parsers.
 */
export declare const buildRoundedRectPath: (x: number, y: number, width: number, height: number, radii: RoundedRectCornerRadii) => string;
export declare const interpolateNumericValuesBetweenPathStrings: (fromPathString: string, toPathString: string, easedProgress: number) => string;
