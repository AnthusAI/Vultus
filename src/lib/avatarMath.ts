const QUARTER_ARC_BEZIER_HANDLE = 0.5522847498;
const SIGNED_DECIMAL_NUMBER_PATTERN = /-?\d+(?:\.\d+)?/g;

export const buildFourSegmentEllipsePath = (
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number
): string => {
  const horizontalHandle = radiusX * QUARTER_ARC_BEZIER_HANDLE;
  const verticalHandle = radiusY * QUARTER_ARC_BEZIER_HANDLE;
  return (
    "M " +
    (centerX - radiusX) +
    " " +
    centerY +
    " " +
    "C " +
    (centerX - radiusX) +
    " " +
    (centerY - verticalHandle) +
    " " +
    (centerX - horizontalHandle) +
    " " +
    (centerY - radiusY) +
    " " +
    centerX +
    " " +
    (centerY - radiusY) +
    " " +
    "C " +
    (centerX + horizontalHandle) +
    " " +
    (centerY - radiusY) +
    " " +
    (centerX + radiusX) +
    " " +
    (centerY - verticalHandle) +
    " " +
    (centerX + radiusX) +
    " " +
    centerY +
    " " +
    "C " +
    (centerX + radiusX) +
    " " +
    (centerY + verticalHandle) +
    " " +
    (centerX + horizontalHandle) +
    " " +
    (centerY + radiusY) +
    " " +
    centerX +
    " " +
    (centerY + radiusY) +
    " " +
    "C " +
    (centerX - horizontalHandle) +
    " " +
    (centerY + radiusY) +
    " " +
    (centerX - radiusX) +
    " " +
    (centerY + verticalHandle) +
    " " +
    (centerX - radiusX) +
    " " +
    centerY +
    " Z"
  );
};

export const buildFourSegmentCurvedLensPath = (
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  curveDirection: "up" | "down"
): string => {
  const horizontalHandle = radiusX * QUARTER_ARC_BEZIER_HANDLE;
  const flatSideRatio = 0.18;
  const curvedSideRatio = 1.5;
  const dipsDownward = curveDirection === "down";
  const topOffset = dipsDownward ? radiusY * flatSideRatio : radiusY * curvedSideRatio;
  const bottomOffset = dipsDownward ? radiusY * curvedSideRatio : radiusY * flatSideRatio;
  const topY = centerY - topOffset;
  const bottomY = centerY + bottomOffset;
  const topVerticalHandle = topOffset * QUARTER_ARC_BEZIER_HANDLE;
  const bottomVerticalHandle = bottomOffset * QUARTER_ARC_BEZIER_HANDLE;
  return (
    "M " +
    (centerX - radiusX) +
    " " +
    centerY +
    " " +
    "C " +
    (centerX - radiusX) +
    " " +
    (centerY - topVerticalHandle) +
    " " +
    (centerX - horizontalHandle) +
    " " +
    topY +
    " " +
    centerX +
    " " +
    topY +
    " " +
    "C " +
    (centerX + horizontalHandle) +
    " " +
    topY +
    " " +
    (centerX + radiusX) +
    " " +
    (centerY - topVerticalHandle) +
    " " +
    (centerX + radiusX) +
    " " +
    centerY +
    " " +
    "C " +
    (centerX + radiusX) +
    " " +
    (centerY + bottomVerticalHandle) +
    " " +
    (centerX + horizontalHandle) +
    " " +
    bottomY +
    " " +
    centerX +
    " " +
    bottomY +
    " " +
    "C " +
    (centerX - horizontalHandle) +
    " " +
    bottomY +
    " " +
    (centerX - radiusX) +
    " " +
    (centerY + bottomVerticalHandle) +
    " " +
    (centerX - radiusX) +
    " " +
    centerY +
    " Z"
  );
};

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
export const buildRoundedRectPath = (
  x: number,
  y: number,
  width: number,
  height: number,
  radii: RoundedRectCornerRadii
): string => {
  const { topLeft, topRight, bottomRight, bottomLeft } = radii;
  return (
    "M " +
    (x + topLeft) +
    " " +
    y +
    " L " +
    (x + width - topRight) +
    " " +
    y +
    " A " +
    topRight +
    " " +
    topRight +
    " 0 0 1 " +
    (x + width) +
    " " +
    (y + topRight) +
    " L " +
    (x + width) +
    " " +
    (y + height - bottomRight) +
    " A " +
    bottomRight +
    " " +
    bottomRight +
    " 0 0 1 " +
    (x + width - bottomRight) +
    " " +
    (y + height) +
    " L " +
    (x + bottomLeft) +
    " " +
    (y + height) +
    " A " +
    bottomLeft +
    " " +
    bottomLeft +
    " 0 0 1 " +
    x +
    " " +
    (y + height - bottomLeft) +
    " L " +
    x +
    " " +
    (y + topLeft) +
    " A " +
    topLeft +
    " " +
    topLeft +
    " 0 0 1 " +
    (x + topLeft) +
    " " +
    y +
    " Z"
  );
};

export const interpolateNumericValuesBetweenPathStrings = (
  fromPathString: string,
  toPathString: string,
  easedProgress: number
): string => {
  const fromPathNumbers = fromPathString.match(SIGNED_DECIMAL_NUMBER_PATTERN)?.map(Number) ?? [];
  const toPathNumbers = toPathString.match(SIGNED_DECIMAL_NUMBER_PATTERN)?.map(Number) ?? [];
  let consumedNumberIndex = 0;
  return fromPathString.replace(SIGNED_DECIMAL_NUMBER_PATTERN, () => {
    const fromValue = fromPathNumbers[consumedNumberIndex] ?? 0;
    const toValue = toPathNumbers[consumedNumberIndex] ?? 0;
    const interpolatedValue = fromValue + (toValue - fromValue) * easedProgress;
    consumedNumberIndex += 1;
    return interpolatedValue.toFixed(3);
  });
};
