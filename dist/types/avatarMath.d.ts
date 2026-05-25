export declare const buildFourSegmentEllipsePath: (centerX: number, centerY: number, radiusX: number, radiusY: number) => string;
export declare const buildFourSegmentCurvedLensPath: (centerX: number, centerY: number, radiusX: number, radiusY: number, curveDirection: "up" | "down") => string;
export declare const interpolateNumericValuesBetweenPathStrings: (fromPathString: string, toPathString: string, easedProgress: number) => string;
